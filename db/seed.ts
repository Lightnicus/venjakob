// This file contains seed data for the database
import { db } from "./db"
import {
  users,
  customers,
  salesOpportunities,
  blocks,
  blockDescriptions,
  articles,
  articleDescriptions,
  offers,
  offerVersions,
  offerBlocks,
  positions,
  orderConfirmations,
} from "./schema"

export async function seed() {
  console.log("🌱 Seeding database...")

  // Clear existing data
  await db.delete(orderConfirmations)
  await db.delete(positions)
  await db.delete(offerBlocks)
  await db.delete(offerVersions)
  await db.delete(offers)
  await db.delete(articleDescriptions)
  await db.delete(articles)
  await db.delete(blockDescriptions)
  await db.delete(blocks)
  await db.delete(salesOpportunities)
  await db.delete(customers)
  await db.delete(users)

  // Seed users
  const [enrica, robert] = await db
    .insert(users)
    .values([
      {
        email: "e.pietig@venjakob.de",
        name: "Enrica Pietig",
        role: "admin",
      },
      {
        email: "r.scharpenberg@venjakob.de",
        name: "Robert Scharpenberg",
        role: "sales",
      },
    ])
    .returning()

  // Seed customers
  const [schueller, techGiant, globalServices, innovate, digital] = await db
    .insert(customers)
    .values([
      {
        name: "Schüller Möbelwerk KG",
        address: "Rother Straße 1",
        city: "Herrieden",
        postalCode: "91567",
        country: "Deutschland",
        contactPerson: "Max Mustermann",
        email: "m.mustermann@schueller.de",
        phone: "+49 123 456789",
      },
      {
        name: "TechGiant GmbH",
        address: "Technikstraße 42",
        city: "Berlin",
        postalCode: "10115",
        country: "Deutschland",
        contactPerson: "Anna Schmidt",
        email: "a.schmidt@techgiant.de",
        phone: "+49 30 123456",
      },
      {
        name: "Global Services AG",
        address: "Serviceweg 10",
        city: "Hamburg",
        postalCode: "20095",
        country: "Deutschland",
        contactPerson: "Thomas Weber",
        email: "t.weber@globalservices.de",
        phone: "+49 40 987654",
      },
      {
        name: "Innovate Solutions GmbH",
        address: "Innovationsallee 25",
        city: "München",
        postalCode: "80331",
        country: "Deutschland",
        contactPerson: "Laura Müller",
        email: "l.mueller@innovate.de",
        phone: "+49 89 555666",
      },
      {
        name: "Digital Transformation AG",
        address: "Digitalstraße 100",
        city: "Frankfurt",
        postalCode: "60311",
        country: "Deutschland",
        contactPerson: "Michael Becker",
        email: "m.becker@digitaltransformation.de",
        phone: "+49 69 777888",
      },
    ])
    .returning()

  // Seed sales opportunities
  const [schuellerOpp, techGiantOpp, globalServicesOpp, innovateOpp, digitalOpp] = await db
    .insert(salesOpportunities)
    .values([
      {
        customerId: schueller.id,
        keyword: "Schüller Umbau 2024",
        status: "qualifiziert",
        phase: "Angebotsphase",
        volume: "2500000",
        deliveryDate: new Date("2024-06-28"),
        responsibleUserId: robert.id,
        probability: 80,
      },
      {
        customerId: techGiant.id,
        keyword: "IT-Infrastruktur Upgrade",
        status: "qualifiziert",
        phase: "Angebotsphase",
        volume: "150000",
        deliveryDate: new Date("2024-04-15"),
        responsibleUserId: enrica.id,
        probability: 60,
      },
      {
        customerId: globalServices.id,
        keyword: "Wartungsvertrag 2024",
        status: "bewertet",
        phase: "Anfrage qualifizieren",
        volume: "75000",
        deliveryDate: new Date("2024-03-01"),
        responsibleUserId: robert.id,
        probability: 40,
      },
      {
        customerId: innovate.id,
        keyword: "Softwarelizenzen Erneuerung",
        status: "gewonnen",
        phase: "Auftrag",
        volume: "50000",
        deliveryDate: new Date("2023-12-15"),
        responsibleUserId: enrica.id,
        probability: 100,
      },
      {
        customerId: digital.id,
        keyword: "Cloud Migration Projekt",
        status: "qualifiziert",
        phase: "Angebotsphase",
        volume: "200000",
        deliveryDate: new Date("2024-05-30"),
        responsibleUserId: robert.id,
        probability: 70,
      },
    ])
    .returning()

  // Seed blocks
  const [introBlock, productsBlock, termsBlock, optionalBlock, referencesBlock] = await db
    .insert(blocks)
    .values([
      {
        name: "Einleitung",
        isStandard: true,
        isMandatory: true,
        position: 1,
        printTitle: true,
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        name: "Produkte",
        isStandard: true,
        isMandatory: false,
        position: 2,
        printTitle: true,
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        name: "Bedingungen und Konditionen",
        isStandard: true,
        isMandatory: true,
        position: 3,
        printTitle: true,
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        name: "Optionale Leistungen",
        isStandard: false,
        isMandatory: false,
        position: null,
        printTitle: true,
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        name: "Referenzen",
        isStandard: false,
        isMandatory: false,
        position: null,
        printTitle: true,
        createdById: enrica.id,
        updatedById: enrica.id,
      },
    ])
    .returning()

  // Seed block descriptions
  await db.insert(blockDescriptions).values([
    {
      blockId: introBlock.id,
      language: "de",
      title: "Einleitung",
      description: "Dieser Block enthält eine Einleitung zum Angebot und stellt das Unternehmen vor.",
    },
    {
      blockId: introBlock.id,
      language: "en",
      title: "Introduction",
      description: "This block contains an introduction to the offer and presents the company.",
    },
    {
      blockId: productsBlock.id,
      language: "de",
      title: "Produkte",
      description: "Dieser Block enthält die angebotenen Produkte und Dienstleistungen.",
    },
    {
      blockId: productsBlock.id,
      language: "en",
      title: "Products",
      description: "This block contains the offered products and services.",
    },
    {
      blockId: termsBlock.id,
      language: "de",
      title: "Bedingungen und Konditionen",
      description: "Dieser Block enthält die Geschäftsbedingungen und Konditionen des Angebots.",
    },
    {
      blockId: termsBlock.id,
      language: "en",
      title: "Terms and Conditions",
      description: "This block contains the terms and conditions of the offer.",
    },
  ])

  // Seed articles
  const [officeChair, executiveChair, basicChair, ergoChair, standardDesk] = await db
    .insert(articles)
    .values([
      {
        articleNumber: "BS1069",
        name: "Bürostuhl Comfort Plus",
        category: "Hardware",
        price: "299.99",
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        articleNumber: "BS1071",
        name: "Bürostuhl Executive",
        category: "Hardware",
        price: "499.99",
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        articleNumber: "BS848",
        name: "Bürostuhl Basic",
        category: "Hardware",
        price: "199.99",
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        articleNumber: "BS1078",
        name: "Bürostuhl Ergonomic",
        category: "Hardware",
        price: "399.99",
        createdById: enrica.id,
        updatedById: enrica.id,
      },
      {
        articleNumber: "ST2001",
        name: "Schreibtisch Standard",
        category: "Hardware",
        price: "399.99",
        createdById: enrica.id,
        updatedById: enrica.id,
      },
    ])
    .returning()

  // Seed article descriptions
  await db.insert(articleDescriptions).values([
    {
      articleId: officeChair.id,
      language: "de",
      title: "Bürostuhl Comfort Plus",
      description: "Komfortabler Bürostuhl mit ergonomischer Rückenlehne und verstellbaren Armlehnen.",
    },
    {
      articleId: officeChair.id,
      language: "en",
      title: "Office Chair Comfort Plus",
      description: "Comfortable office chair with ergonomic backrest and adjustable armrests.",
    },
    {
      articleId: executiveChair.id,
      language: "de",
      title: "Bürostuhl Executive",
      description: "Hochwertiger Chefsessel mit Lederbezug und Massagefunktion.",
    },
    {
      articleId: executiveChair.id,
      language: "en",
      title: "Executive Chair",
      description: "High-quality executive chair with leather upholstery and massage function.",
    },
  ])

  // Seed offers and versions
  // First offer - Büroausstattung
  const offer1 = await db
    .insert(offers)
    .values({
      offerNumber: "1000",
      customerId: schueller.id,
      salesOpportunityId: schuellerOpp.id,
      validUntil: new Date("2023-03-15"),
      createdById: enrica.id,
      updatedById: enrica.id,
    })
    .returning()
    .then((res) => res[0])

  // First version of offer 1
  const offer1v1 = await db
    .insert(offerVersions)
    .values({
      offerId: offer1.id,
      versionNumber: "V1",
      title: "Büroausstattung",
      description: "Dieses Angebot umfasst die Lieferung von Büroausstattung gemäß den Anforderungen des Kunden.",
      status: "Entwurf",
      recipientName: "Max Mustermann",
      recipientEmail: "m.mustermann@schueller.de",
      recipientPhone: "+49 123 456789",
      changeTitle: "Initiale Version",
      changeDescription: "Erste Version des Angebots für Büroausstattung.",
      publishedById: enrica.id,
      publishedAt: new Date("2023-01-15"),
    })
    .returning()
    .then((res) => res[0])

  // Update offer with current version
  await db
    .update(offers)
    .set({
      currentVersionId: offer1v1.id,
    })
    .where({ id: offer1.id })

  // Add blocks to offer version
  const [offer1v1Block1, offer1v1Block2, offer1v1Block3] = await db
    .insert(offerBlocks)
    .values([
      {
        offerVersionId: offer1v1.id,
        blockId: introBlock.id,
        position: 1,
      },
      {
        offerVersionId: offer1v1.id,
        blockId: productsBlock.id,
        position: 2,
      },
      {
        offerVersionId: offer1v1.id,
        blockId: termsBlock.id,
        position: 3,
      },
    ])
    .returning()

  // Add positions to offer version
  await db.insert(positions).values([
    {
      offerVersionId: offer1v1.id,
      blockId: productsBlock.id,
      articleId: officeChair.id,
      name: "Bürostühle",
      quantity: "5",
      unit: "Stück",
      unitPrice: "299.99",
      discount: "0",
      totalPrice: "1499.95",
      isOption: false,
      position: 1,
    },
    {
      offerVersionId: offer1v1.id,
      blockId: productsBlock.id,
      articleId: standardDesk.id,
      name: "Schreibtische",
      quantity: "5",
      unit: "Stück",
      unitPrice: "399.99",
      discount: "0",
      totalPrice: "1999.95",
      isOption: false,
      position: 2,
    },
    {
      offerVersionId: offer1v1.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Aktenschränke",
      quantity: "2",
      unit: "Stück",
      unitPrice: "379.99",
      discount: "5",
      totalPrice: "759.98",
      isOption: false,
      position: 3,
    },
  ])

  // Second version of offer 1
  const offer1v2 = await db
    .insert(offerVersions)
    .values({
      offerId: offer1.id,
      versionNumber: "V2",
      title: "Büroausstattung (Alternative)",
      description:
        "Dieses Angebot umfasst die Lieferung von alternativer Büroausstattung gemäß den Anforderungen des Kunden.",
      status: "Veröffentlicht",
      recipientName: "Max Mustermann",
      recipientEmail: "m.mustermann@schueller.de",
      recipientPhone: "+49 123 456789",
      changeTitle: "Alternative Ausstattung",
      changeDescription: "Angepasste Version mit Premium-Bürostühlen und höhenverstellbaren Schreibtischen.",
      publishedById: enrica.id,
      publishedAt: new Date("2023-01-18"),
    })
    .returning()
    .then((res) => res[0])

  // Update offer with current version
  await db
    .update(offers)
    .set({
      currentVersionId: offer1v2.id,
    })
    .where({ id: offer1.id })

  // Add blocks to offer version
  const [offer1v2Block1, offer1v2Block2, offer1v2Block3] = await db
    .insert(offerBlocks)
    .values([
      {
        offerVersionId: offer1v2.id,
        blockId: introBlock.id,
        position: 1,
      },
      {
        offerVersionId: offer1v2.id,
        blockId: productsBlock.id,
        position: 2,
      },
      {
        offerVersionId: offer1v2.id,
        blockId: termsBlock.id,
        position: 3,
      },
    ])
    .returning()

  // Add positions to offer version
  await db.insert(positions).values([
    {
      offerVersionId: offer1v2.id,
      blockId: productsBlock.id,
      articleId: executiveChair.id,
      name: "Bürostühle (Premium)",
      quantity: "5",
      unit: "Stück",
      unitPrice: "399.99",
      discount: "0",
      totalPrice: "1999.95",
      isOption: false,
      position: 1,
    },
    {
      offerVersionId: offer1v2.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Schreibtische (Höhenverstellbar)",
      quantity: "5",
      unit: "Stück",
      unitPrice: "699.99",
      discount: "0",
      totalPrice: "3499.95",
      isOption: false,
      position: 2,
    },
    {
      offerVersionId: offer1v2.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Aktenschränke",
      quantity: "2",
      unit: "Stück",
      unitPrice: "379.99",
      discount: "5",
      totalPrice: "759.98",
      isOption: false,
      position: 3,
    },
  ])

  // Create another offer with multiple versions
  const offer2 = await db
    .insert(offers)
    .values({
      offerNumber: "1003",
      customerId: innovate.id,
      salesOpportunityId: innovateOpp.id,
      validUntil: new Date("2023-03-28"),
      createdById: enrica.id,
      updatedById: enrica.id,
    })
    .returning()
    .then((res) => res[0])

  // First version of offer 2
  const offer2v1 = await db
    .insert(offerVersions)
    .values({
      offerId: offer2.id,
      versionNumber: "V1",
      title: "Softwarelizenzen",
      description: "Dieses Angebot umfasst Softwarelizenzen für 10 Benutzer.",
      status: "Entwurf",
      recipientName: "Laura Müller",
      recipientEmail: "l.mueller@innovate.de",
      recipientPhone: "+49 89 555666",
      changeTitle: "Initiale Version",
      changeDescription: "Erste Version des Angebots für Softwarelizenzen.",
      publishedById: enrica.id,
      publishedAt: new Date("2023-01-26"),
    })
    .returning()
    .then((res) => res[0])

  // Add blocks to offer version
  const [offer2v1Block1, offer2v1Block2] = await db
    .insert(offerBlocks)
    .values([
      {
        offerVersionId: offer2v1.id,
        blockId: introBlock.id,
        position: 1,
      },
      {
        offerVersionId: offer2v1.id,
        blockId: productsBlock.id,
        position: 2,
      },
    ])
    .returning()

  // Add positions to offer version
  await db.insert(positions).values([
    {
      offerVersionId: offer2v1.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Office-Lizenzen",
      quantity: "10",
      unit: "Stück",
      unitPrice: "150.00",
      discount: "0",
      totalPrice: "1500.00",
      isOption: false,
      position: 1,
    },
  ])

  // Second version of offer 2
  const offer2v2 = await db
    .insert(offerVersions)
    .values({
      offerId: offer2.id,
      versionNumber: "V2",
      title: "Softwarelizenzen",
      description: "Dieses Angebot umfasst Softwarelizenzen für 15 Benutzer.",
      status: "Entwurf",
      recipientName: "Laura Müller",
      recipientEmail: "l.mueller@innovate.de",
      recipientPhone: "+49 89 555666",
      changeTitle: "Erhöhung der Benutzeranzahl und Antivirensoftware",
      changeDescription: "Erhöhung der Benutzeranzahl von 10 auf 15 und Hinzufügen von Antivirensoftware.",
      publishedById: enrica.id,
      publishedAt: new Date("2023-01-27"),
    })
    .returning()
    .then((res) => res[0])

  // Add blocks to offer version
  const [offer2v2Block1, offer2v2Block2] = await db
    .insert(offerBlocks)
    .values([
      {
        offerVersionId: offer2v2.id,
        blockId: introBlock.id,
        position: 1,
      },
      {
        offerVersionId: offer2v2.id,
        blockId: productsBlock.id,
        position: 2,
      },
    ])
    .returning()

  // Add positions to offer version
  await db.insert(positions).values([
    {
      offerVersionId: offer2v2.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Office-Lizenzen",
      quantity: "15",
      unit: "Stück",
      unitPrice: "150.00",
      discount: "0",
      totalPrice: "2250.00",
      isOption: false,
      position: 1,
    },
    {
      offerVersionId: offer2v2.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Antivirensoftware",
      quantity: "15",
      unit: "Stück",
      unitPrice: "50.00",
      discount: "0",
      totalPrice: "750.00",
      isOption: false,
      position: 2,
    },
  ])

  // Third version of offer 2
  const offer2v3 = await db
    .insert(offerVersions)
    .values({
      offerId: offer2.id,
      versionNumber: "V3",
      title: "Softwarelizenzen",
      description: "Dieses Angebot umfasst Softwarelizenzen für 20 Benutzer.",
      status: "Veröffentlicht",
      recipientName: "Laura Müller",
      recipientEmail: "l.mueller@innovate.de",
      recipientPhone: "+49 89 555666",
      changeTitle: "Erweiterung um Projektmanagement-Software",
      changeDescription:
        "Hinzufügen von Projektmanagement-Software für 5 Benutzer und Preisanpassung für bestehende Positionen.",
      publishedById: enrica.id,
      publishedAt: new Date("2023-01-28"),
    })
    .returning()
    .then((res) => res[0])

  // Update offer with current version
  await db
    .update(offers)
    .set({
      currentVersionId: offer2v3.id,
    })
    .where({ id: offer2.id })

  // Add blocks to offer version
  const [offer2v3Block1, offer2v3Block2] = await db
    .insert(offerBlocks)
    .values([
      {
        offerVersionId: offer2v3.id,
        blockId: introBlock.id,
        position: 1,
      },
      {
        offerVersionId: offer2v3.id,
        blockId: productsBlock.id,
        position: 2,
      },
    ])
    .returning()

  // Add positions to offer version
  await db.insert(positions).values([
    {
      offerVersionId: offer2v3.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Office-Lizenzen",
      quantity: "20",
      unit: "Stück",
      unitPrice: "145.00",
      discount: "0",
      totalPrice: "2900.00",
      isOption: false,
      position: 1,
    },
    {
      offerVersionId: offer2v3.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Antivirensoftware",
      quantity: "20",
      unit: "Stück",
      unitPrice: "45.00",
      discount: "0",
      totalPrice: "900.00",
      isOption: false,
      position: 2,
    },
    {
      offerVersionId: offer2v3.id,
      blockId: productsBlock.id,
      articleId: null,
      name: "Projektmanagement-Software",
      quantity: "5",
      unit: "Stück",
      unitPrice: "200.00",
      discount: "0",
      totalPrice: "1000.00",
      isOption: false,
      position: 3,
    },
  ])

  // Create an order confirmation
  await db.insert(orderConfirmations).values({
    confirmationNumber: "AB-2023-001",
    offerId: offer2.id,
    offerVersionId: offer2v3.id,
    customerId: innovate.id,
    confirmationDate: new Date("2023-01-30"),
    totalAmount: "4800.00",
    createdById: enrica.id,
  })

  console.log("✅ Database seeded successfully!")
}
