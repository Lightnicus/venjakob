import { db } from '../index';
import { languages, blocks, blockContent } from '../schema';
import { eq } from 'drizzle-orm';

export async function seedBlocks() {
  try {
    console.log('Seeding languages...');
    
    // Check if languages already exist, if not insert them
    let germanLang = await db.select().from(languages).where(eq(languages.value, 'de')).then(rows => rows[0]);
    let englishLang = await db.select().from(languages).where(eq(languages.value, 'en')).then(rows => rows[0]);
    
    if (!germanLang) {
      [germanLang] = await db.insert(languages).values({
        value: 'de',
        label: 'Deutsch',
      }).returning();
    }
    
    if (!englishLang) {
      [englishLang] = await db.insert(languages).values({
        value: 'en',
        label: 'English',
      }).returning();
    }

    console.log('Seeding blocks...');
    
    // Check if blocks already exist
    const existingBlocks = await db.select().from(blocks);
    if (existingBlocks.length > 0) {
      console.log('Blocks already exist, skipping block seeding...');
      console.log('✅ Seeding completed (data already exists)!');
      return;
    }
    
    // Insert blocks
    const [coverLetterBlock, techSpecsBlock, conclusionBlock] = await db.insert(blocks).values([
      {
        name: 'Allgemeines Anschreiben',
        standard: true,
        mandatory: false,
        position: 1,
        hideTitle: false,
        pageBreakAbove: false,
      },
      {
        name: 'Technische Spezifikationen',
        standard: false,
        mandatory: true,
        position: 2,
        hideTitle: false,
        pageBreakAbove: true,
      },
      {
        name: 'Abschluss',
        standard: true,
        mandatory: false,
        position: 3,
        hideTitle: true,
        pageBreakAbove: false,
      }
    ]).returning();

    console.log('Seeding block content...');
    
    // Insert block content
    await db.insert(blockContent).values([
      // Cover Letter - German
      {
        blockId: coverLetterBlock.id,
        title: 'Anschreiben',
        content: `<p>Sehr geehrte Damen und Herren,</p>
<p>vielen Dank für Ihr Interesse an unseren Produkten. Gerne unterbreiten wir Ihnen hiermit unser Angebot für die gewünschten Artikel.</p>
<p>Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer.</p>`,
        languageId: germanLang.id,
      },
      // Cover Letter - English
      {
        blockId: coverLetterBlock.id,
        title: 'Cover Letter',
        content: `<p>Dear Sir or Madam,</p>
<p>Thank you for your interest in our products. We are pleased to submit our offer for the requested items.</p>
<p>All prices are exclusive of statutory VAT.</p>`,
        languageId: englishLang.id,
      },
      // Technical Specifications - German
      {
        blockId: techSpecsBlock.id,
        title: 'Technische Spezifikationen',
        content: `<h3>Technische Details</h3>
<ul>
<li>Hochwertige Materialien</li>
<li>Präzise Verarbeitung</li>
<li>Langlebige Konstruktion</li>
<li>Wartungsfreundlich</li>
</ul>
<p>Alle technischen Angaben entsprechen dem aktuellen Stand der Technik.</p>`,
        languageId: germanLang.id,
      },
      // Technical Specifications - English
      {
        blockId: techSpecsBlock.id,
        title: 'Technical Specifications',
        content: `<h3>Technical Details</h3>
<ul>
<li>High-quality materials</li>
<li>Precise manufacturing</li>
<li>Durable construction</li>
<li>Maintenance-friendly</li>
</ul>
<p>All technical specifications correspond to the current state of technology.</p>`,
        languageId: englishLang.id,
      },
      // Conclusion - German
      {
        blockId: conclusionBlock.id,
        title: 'Abschluss',
        content: `<p>Wir hoffen, Ihnen mit unserem Angebot zu entsprechen und freuen uns auf Ihre Bestellung.</p>
<p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
<p>Mit freundlichen Grüßen<br/>
Ihr Venjakob-Team</p>`,
        languageId: germanLang.id,
      },
      // Conclusion - English
      {
        blockId: conclusionBlock.id,
        title: 'Conclusion',
        content: `<p>We hope our offer meets your requirements and look forward to your order.</p>
<p>Please do not hesitate to contact us if you have any questions.</p>
<p>Kind regards<br/>
Your Venjakob Team</p>`,
        languageId: englishLang.id,
      },
    ]);

    console.log('✅ Blocks seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding blocks:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedBlocks().catch(console.error);
} 