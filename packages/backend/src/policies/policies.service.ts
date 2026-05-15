import { Injectable, Logger } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import pLimit from 'p-limit';

import { EmbeddingsService } from './embeddings.service';
import { PoliciesRepository } from './policies.repository';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  private pdfExtract: any;

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly policiesRepository: PoliciesRepository
  ) { }

  async processAndIngestPolicy(
    fileBuffer: Buffer,
    mimetype: string,
    companyId: string,
    name: string,
  ) {
    this.logger.log(
      `Starting ingestion for policy: ${name} (Company: ${companyId})`,
    );

    // STEP 1: Extract page-level documents
    const pageDocuments = await this.extractTextFromFile(
      fileBuffer,
      mimetype,
    );

    // STEP 2: Semantic chunking
    const structuralChunks = await this.chunkDocuments(pageDocuments);

    this.logger.log(
      `Generating embeddings for ${structuralChunks.length} semantic chunks...`,
    );

    const limit = pLimit(5);

    const chunksWithEmbeddings = await Promise.all(
      structuralChunks.map((chunk, i) =>
        limit(async () => {
          const m = chunk.metadata;

          const hierarchyPath = [
            m.H1,
            m.H2,
            m.H3,
            m.H4,
            m.H5,
            m.H6,
          ]
            .filter(Boolean)
            .join(' > ');

          const textToEmbed = `
Document: ${name}
Section: ${hierarchyPath || 'General'}
Pages: ${m.startPage}${m.endPage !== m.startPage ? `-${m.endPage}` : ''}

${chunk.pageContent}
`;

          const embedding =
            await this.embeddingsService.embedDocument(textToEmbed);

          return {
            content: chunk.pageContent,
            embedding,
            chunkIndex: i,
            metadata: {
              section: hierarchyPath || 'General',
              startPage: m.startPage,
              endPage: m.endPage,
            },
          };
        }),
      ),
    );

    // STEP 4: Save to DB
    this.logger.log(
      `Saving policy and ${chunksWithEmbeddings.length} chunks to database...`,
    );

    const savedPolicy = await this.policiesRepository.savePolicyAndChunks(
      companyId,
      name,
      chunksWithEmbeddings,
    );

    this.logger.log(`Successfully ingested policy ID: ${savedPolicy.id}`);

    return {
      policyId: savedPolicy.id,
      chunksProcessed: chunksWithEmbeddings.length,
    };
  }

  async extractTextFromFile(
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<Document[]> {
    if (mimetype === 'application/pdf') {
      try {
        if (!this.pdfExtract) {
          const module = await import('pdf.js-extract');
          this.pdfExtract = new module.PDFExtract();
        }

        const data = await this.pdfExtract.extractBuffer(fileBuffer, {});
        const documents: Document[] = [];

        const fontSizes: number[] = [];

        // Pass 1: determine base font size
        data.pages.forEach((page) => {
          page.content.forEach((item) => {
            if (item.str.trim().length > 0) {
              fontSizes.push(item.height);
            }
          });
        });

        const baseFontSize =
          this.calculateMostFrequentSize(fontSizes);

        // Pass 1.5: strip headers/footers before reconstruction
        const cleanedPages = this.filterHeadersAndFooters(data.pages);

        // Pass 2: create one document per page
        cleanedPages.forEach((page, pageIndex) => {
          let markdown = '';

          const sortedContent = [...page.content].sort(
            (a, b) => {
              // sort top-to-bottom, then left-to-right
              if (Math.abs(a.y - b.y) > 2) {
                return a.y - b.y;
              }

              return a.x - b.x;
            },
          );

          let currentLineY = -1;
          let lastItemRightEdge = -1;

          sortedContent.forEach((item) => {
            const text = item.str.trim();

            if (!text) return;

            if (Math.abs(item.y - currentLineY) > 2) {
              markdown += '\n';

              currentLineY = item.y;
              // Fallback width if missing: approx 0.5 * height per char
              lastItemRightEdge = item.x + (item.width || text.length * (item.height * 0.5));

              if (item.height >= baseFontSize * 1.5) {
                markdown += '\n# ';
              } else if (item.height >= baseFontSize * 1.2) {
                markdown += '\n## ';
              } else if (item.height >= baseFontSize * 1.1) {
                markdown += '\n### ';
              }
            } else {
              // Calculate horizontal visual gap between last item and this item
              const gap = item.x - lastItemRightEdge;

              // If the gap is larger than ~20% of the font height, it is an actual space.
              // If it's smaller, it's just kerning/tracking within the same word.
              if (gap > item.height * 0.2) {
                markdown += ' ';
              }

              lastItemRightEdge = item.x + (item.width || text.length * (item.height * 0.5));
            }

            markdown += text;
          });

          documents.push(
            new Document({
              pageContent: markdown.trim(),
              metadata: {
                startPage: pageIndex + 1,
                endPage: pageIndex + 1,
              },
            }),
          );
        });

        return documents;
      } catch (error) {
        this.logger.error(
          'Failed to parse PDF document',
          error,
        );

        throw new Error('Failed to parse PDF document');
      }
    }

    return [
      new Document({
        pageContent: fileBuffer.toString('utf8').trim(),
        metadata: {
          startPage: 1,
          endPage: 1,
        },
      }),
    ];
  }

  async chunkDocuments(
    documents: Document[],
  ): Promise<Document[]> {
    // Drop pages whose content is purely structural (cover pages, TOC, blank pages)
    const contentDocuments = this.filterStructuralOnlyPages(documents);

    this.logger.log(
      `Retained ${contentDocuments.length}/${documents.length} pages after cover/structural page filter`,
    );

    const structuralChunks: Document[] = [];

    // STEP 1: split by semantic headers
    for (const doc of contentDocuments) {
      const chunks = this.splitMarkdownByHeaders(
        doc.pageContent,
        doc.metadata.startPage,
        doc.metadata.endPage,
      );

      structuralChunks.push(...chunks);
    }

    // STEP 2: recursively split oversized chunks
    const recursiveSplitter =
      new RecursiveCharacterTextSplitter({
        chunkSize: 1500,
        chunkOverlap: 150,
      });

    const finalChunks: Document[] = [];

    for (const chunk of structuralChunks) {
      if (chunk.pageContent.length > 2000) {
        const subChunks =
          await recursiveSplitter.splitDocuments([chunk]);

        subChunks.forEach((subChunk) => {
          subChunk.metadata = {
            ...chunk.metadata,
            ...subChunk.metadata,
          };
        });

        finalChunks.push(...subChunks);
      } else {
        finalChunks.push(chunk);
      }
    }

    this.logger.log(
      `Generated ${finalChunks.length} semantic chunks`,
    );

    return finalChunks;
  }

  private splitMarkdownByHeaders(
    text: string,
    startPage: number,
    endPage: number,
  ): Document[] {
    const lines = text.split('\n');

    const chunks: Document[] = [];

    const currentMetadata: Record<string, any> = {};

    let currentContent: string[] = [];

    const pushChunk = () => {
      const content = currentContent.join('\n').trim();

      if (!content) return;

      chunks.push(
        new Document({
          pageContent: content,
          metadata: {
            ...currentMetadata,
            startPage,
            endPage,
          },
        }),
      );

      currentContent = [];
    };

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.*)/);

      if (match) {
        pushChunk();

        const level = match[1].length;

        currentMetadata[`H${level}`] =
          match[2].trim();

        // Clear deeper headers
        for (let i = level + 1; i <= 6; i++) {
          delete currentMetadata[`H${i}`];
        }
      } else {
        currentContent.push(line);
      }
    }

    pushChunk();

    return chunks;
  }

  /**
   * Drops pages that contain only structural elements (headers, bullets, blank lines)
   * and no meaningful body text. This removes cover pages, table-of-contents pages,
   * and blank separator pages before chunking.
   *
   * A page is considered structural-only if the non-header, non-bullet text
   * remaining is shorter than MIN_BODY_LENGTH characters.
   */
  private filterStructuralOnlyPages(
    documents: Document[],
    minBodyLength = 50,
  ): Document[] {
    return documents.filter((doc) => {
      // Strip markdown headers (# ...) and bullet points (• or -)
      const bodyText = doc.pageContent
        .replace(/^#+\s+.*/gm, '')    // remove header lines
        .replace(/^[•\-\*]\s+.*/gm, '') // remove bullet lines
        .trim();

      return bodyText.length >= minBodyLength;
    });
  }

  /**
   * Removes header and footer text from PDF pages before reconstruction.
   *
   * Uses two combined heuristics:
   *  1. Position — items in the top 8% or bottom 8% of the page height are removed.
   *  2. Frequency — items whose text appears on 3+ pages are treated as boilerplate.
   */
  private filterHeadersAndFooters(pages: any[]): any[] {
    const textFrequency = new Map<string, number>();

    // PASS 1: count how many pages each text fragment appears on
    for (const page of pages) {
      // Use a Set so the same text on the same page is only counted once
      const seenOnPage = new Set<string>();
      for (const item of page.content) {
        const text = item.str?.trim();
        if (!text || seenOnPage.has(text)) continue;
        seenOnPage.add(text);
        textFrequency.set(text, (textFrequency.get(text) || 0) + 1);
      }
    }

    // Dynamic threshold: at least 3 pages, or 40% of total pages
    const REPEAT_THRESHOLD = Math.max(3, Math.ceil(pages.length * 0.4));

    return pages.map((page) => {
      const pageHeight: number = page.height ?? 842; // A4 fallback
      const HEADER_ZONE = pageHeight * 0.08;
      const FOOTER_ZONE = pageHeight * 0.92;

      const filtered = page.content.filter((item: any) => {
        const text = item.str?.trim();
        if (!text) return false;

        const isPositionalNoise =
          item.y < HEADER_ZONE || item.y > FOOTER_ZONE;

        const isBoilerplate =
          (textFrequency.get(text) ?? 0) >= REPEAT_THRESHOLD;

        return !(isPositionalNoise || isBoilerplate);
      });

      return { ...page, content: filtered };
    });
  }

  private calculateMostFrequentSize(
    sizes: number[],
  ): number {
    if (sizes.length === 0) return 12;

    const counts: Record<number, number> = {};

    let compare = 0;
    let mostFrequent = sizes[0];

    for (const size of sizes) {
      const roundedSize = Math.round(size);

      counts[roundedSize] =
        (counts[roundedSize] || 0) + 1;

      if (counts[roundedSize] > compare) {
        compare = counts[roundedSize];
        mostFrequent = roundedSize;
      }
    }

    return mostFrequent;
  }
}