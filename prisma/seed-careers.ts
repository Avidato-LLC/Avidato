const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const careers = [
  { title: 'AI Engineer / ML Developer' },
  { title: 'Full-stack Developer' },
  { title: 'UI/UX Designer' },
  { title: 'ESL Content Specialist' },
  { title: 'Product Manager' },
  { title: 'Marketing Lead / Growth Hacker' },
  { title: 'QA Engineer' },
  { title: 'Data Analyst' },
  { title: 'Community Manager / Customer Success' },
  { title: 'DevOps Engineer' },
  { title: 'Finance / Operations Manager' },
  { title: 'Educational Researcher' },
  { title: 'Partnership / B2B Sales Lead' },
  { title: 'Social Media Manager' },
]

async function main() {
  for (const career of careers) {
    await prisma.career.upsert({
      where: { title: career.title },
      update: {},
      create: {
        title: career.title,
        typeformUrl: 'https://form.typeform.com/to/almI6bRO',
      },
    })
  }
  console.log('Careers seeded.')
}

main().finally(() => prisma.$disconnect())
