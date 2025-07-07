import { db } from '../index';
import { languages, clients, contactPersons, salesOpportunities } from '../schema';
import { eq } from 'drizzle-orm';

export async function seedTestSalesOpportunity() {
  try {
    console.log('Creating test sales opportunity data...');
    
    // Get German language (should already exist from language seeds)
    const germanLang = await db.select().from(languages).where(eq(languages.value, 'de')).then(rows => rows[0]);
    
    if (!germanLang) {
      throw new Error('German language not found. Please run language seeds first.');
    }

    console.log('Creating test client...');
    
    // Create the client
    const [testClient] = await db.insert(clients).values({
      name: 'Test GmbH',
      foreignId: 'TEST',
      languageId: germanLang.id,
    }).returning();

    console.log('Creating contact person...');
    
    // Create the contact person
    const [testContactPerson] = await db.insert(contactPersons).values({
      clientId: testClient.id,
      name: 'Briem',
      firstName: 'Ed',
      email: 'eduard.briem@gmail.com',
      phone: '12345',
      position: 'Sales Manager',
    }).returning();

    console.log('Creating sales opportunity...');
    
    // Create the sales opportunity
    const [testSalesOpportunity] = await db.insert(salesOpportunities).values({
      crmId: 'TEST12345',
      clientId: testClient.id,
      contactPersonId: testContactPerson.id,
      businessArea: 'IT Entwicklung',
      keyword: 'Test, IT',
      status: 'open',
      createdBy: 'ab48acb2-a340-43a7-89cb-757fbab80884',
    }).returning();

    console.log('✅ Test sales opportunity seeding completed successfully!');
    console.log('Created:');
    console.log('- Client:', testClient.name, `(ID: ${testClient.id})`);
    console.log('- Contact Person:', `${testContactPerson.firstName} ${testContactPerson.name}`, `(ID: ${testContactPerson.id})`);
    console.log('- Sales Opportunity:', testSalesOpportunity.crmId, `(ID: ${testSalesOpportunity.id})`);
    
    return {
      client: testClient,
      contactPerson: testContactPerson,
      salesOpportunity: testSalesOpportunity,
    };
  } catch (error) {
    console.error('❌ Error seeding test sales opportunity:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedTestSalesOpportunity().catch(console.error);
} 