import { PrismaClient, TagCategory } from '@prisma/client';

const prisma = new PrismaClient();

const HOBBIES = [
  'hiking', 'board games', 'cooking', 'live music', 'rock climbing',
  'travel', 'photography', 'gardening', 'wine tasting', 'cycling',
  'video games', 'reading', 'running', 'yoga', 'camping', 'skiing',
  'painting', 'pottery', 'surfing', 'dancing',
];

const INTERESTS = [
  'film', 'true crime podcasts', 'stand-up comedy', 'craft beer',
  'foodie culture', 'astrology', 'sci-fi', 'live sports', 'fashion',
  'interior design', 'startups', 'philosophy', 'true nature docs',
  'vinyl records', 'cars', 'DIY renovation', 'plants',
];

const VALUES = [
  'we prioritize family time', 'career-focused', 'homebodies',
  'always traveling', 'early risers', 'night owls', 'no kids by choice',
  'want kids someday', 'pet parents', 'minimalists', 'foodies over fancy plans',
  'faith is important to us', 'not religious', 'fitness-focused',
];

const POLITICS = [
  'progressive', 'conservative', 'moderate', 'libertarian',
  'climate-focused', 'not political', 'community organizers',
];

async function main() {
  const all: { label: string; category: TagCategory }[] = [
    ...HOBBIES.map((label) => ({ label, category: TagCategory.HOBBY })),
    ...INTERESTS.map((label) => ({ label, category: TagCategory.INTEREST })),
    ...VALUES.map((label) => ({ label, category: TagCategory.VALUE })),
    ...POLITICS.map((label) => ({ label, category: TagCategory.POLITICS })),
  ];

  for (const tag of all) {
    await prisma.tag.upsert({
      where: { label: tag.label },
      update: {},
      create: tag,
    });
  }

  console.log(`Seeded ${all.length} tags.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
