import { PrismaClient, SectionType, SectionLayout, LocationType, JobType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a test company
  const company = await prisma.company.upsert({
    where: { slug: 'techcorp' },
    update: {},
    create: {
      slug: 'techcorp',
      name: 'TechCorp Solutions',
      description: 'Building the future of technology, one innovation at a time.',
      isPublished: true,
    },
  })

  console.log('✅ Created company:', company.name)

  // Create an admin user
  const hashedPassword = await hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'recruiter@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter@techcorp.com',
      password: hashedPassword,
      name: 'John Admin',
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  console.log('✅ Created user:', user.email)

  // Create company theme
  const theme = await prisma.companyTheme.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      logoUrl: 'https://via.placeholder.com/200x60/3B82F6/ffffff?text=TechCorp',
      bannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
      videoUrl: null,
    },
  })

  console.log('✅ Created theme')

  // Create page sections
  const sections = [
    {
      companyId: company.id,
      type: SectionType.ABOUT,
      title: 'About Us',
      layout: SectionLayout.FULL_WIDTH,
      content: {
        html: '<p>TechCorp Solutions is a leading technology company dedicated to creating innovative solutions that transform businesses. With over 10 years of experience, we pride ourselves on our cutting-edge technology and exceptional team culture.</p>',
      },
      order: 0,
      columnGroup: 0,
      columnIndex: 0,
      isVisible: true,
    },
    {
      companyId: company.id,
      type: SectionType.CULTURE,
      title: 'Life at TechCorp',
      layout: SectionLayout.FULL_WIDTH,
      content: {
        html: '<p>At TechCorp, we believe in work-life balance, continuous learning, and innovation. Our team members enjoy flexible working hours, remote work options, and a collaborative environment where ideas flourish.</p>',
      },
      order: 1,
      columnGroup: 1,
      columnIndex: 0,
      isVisible: true,
    },
    {
      companyId: company.id,
      type: SectionType.BENEFITS,
      title: 'Benefits & Perks',
      layout: SectionLayout.FULL_WIDTH,
      content: {
        html: '<ul><li>Competitive salary and equity packages</li><li>Health, dental, and vision insurance</li><li>Flexible PTO policy</li><li>401k matching</li></ul>',
      },
      order: 2,
      columnGroup: 2,
      columnIndex: 0,
      isVisible: true,
    },
    {
      companyId: company.id,
      type: SectionType.CUSTOM,
      title: 'Work Environment',
      layout: SectionLayout.FULL_WIDTH,
      content: {
        html: '<ul><li>Remote work options</li><li>Learning and development budget</li><li>Modern office with free snacks and drinks</li><li>Team building events</li></ul>',
      },
      order: 3,
      columnGroup: 2,
      columnIndex: 1,
      isVisible: true,
    },
  ]

  for (const section of sections) {
    await prisma.pageSection.create({ data: section })
  }

  console.log('✅ Created page sections')

  // Create sample jobs from CSV data
  const jobs = [
    {
      companyId: company.id,
      title: 'Full Stack Engineer',
      department: 'Product',
      location: 'Berlin, Germany',
      locationType: LocationType.REMOTE,
      jobType: JobType.FULL_TIME,
      description: 'We are looking for an experienced Full Stack Engineer to join our Product team. You will work on building scalable web applications using modern technologies like React, Node.js, and PostgreSQL. This is a remote position with flexible working hours.',
      requirements: 'Requirements: 5+ years of experience in web development, proficiency in React and Node.js, strong understanding of databases, excellent problem-solving skills. Senior level experience required.',
      salary: 'AED 8K–12K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'UX Researcher',
      department: 'Engineering',
      location: 'Boston, United States',
      locationType: LocationType.HYBRID,
      jobType: JobType.FULL_TIME,
      description: 'Join our Engineering team to conduct user research and help shape product decisions. You will collaborate with designers and product managers to understand user needs and validate design solutions.',
      requirements: 'Requirements: 4+ years of UX research experience, proficiency in qualitative and quantitative research methods, strong analytical skills, excellent communication abilities. Senior level preferred.',
      salary: 'USD 4K–6K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Frontend Engineer',
      department: 'Engineering',
      location: 'Athens, Greece',
      locationType: LocationType.HYBRID,
      jobType: JobType.PART_TIME,
      description: 'We need a talented Frontend Engineer to build beautiful and performant user interfaces. You will work with React, TypeScript, and modern CSS frameworks to create exceptional user experiences.',
      requirements: 'Requirements: 2+ years of frontend development experience, proficiency in React and TypeScript, strong CSS skills, attention to detail. Junior level welcome.',
      salary: 'USD 80K–120K / year',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Product Designer',
      department: 'Operations',
      location: 'Boston, United States',
      locationType: LocationType.ONSITE,
      jobType: JobType.PART_TIME,
      description: 'Join our Operations team to create beautiful, user-friendly interfaces. You will collaborate with product managers and engineers to design and ship features that delight our users.',
      requirements: 'Requirements: 3+ years of product design experience, proficiency in Figma, strong portfolio, excellent communication skills. Mid-level experience required.',
      salary: 'AED 12K–18K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'DevOps Engineer',
      department: 'Customer Success',
      location: 'Dubai, United Arab Emirates',
      locationType: LocationType.HYBRID,
      jobType: JobType.CONTRACT,
      description: 'We need a skilled DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will ensure our systems are reliable, scalable, and secure.',
      requirements: 'Requirements: 2+ years of DevOps experience, expertise in AWS/GCP, proficiency in Docker and Kubernetes, experience with monitoring tools. Junior level welcome.',
      salary: 'USD 80K–120K / year',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'AI Product Manager',
      department: 'Operations',
      location: 'Athens, Greece',
      locationType: LocationType.ONSITE,
      jobType: JobType.INTERNSHIP,
      description: 'Join our team as an AI Product Manager Intern and gain hands-on experience in managing AI-powered products. You will work with engineering and design teams to define product requirements.',
      requirements: 'Requirements: Currently pursuing or recently completed a degree in Computer Science, Business, or related field. Strong interest in AI and product management. Junior level position.',
      salary: 'INR 8L–15L / year',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Data Analyst',
      department: 'Customer Success',
      location: 'Dubai, United Arab Emirates',
      locationType: LocationType.ONSITE,
      jobType: JobType.FULL_TIME,
      description: 'Analyze customer data to drive insights and improve customer success metrics. You will work with SQL, Python, and BI tools to create dashboards and reports.',
      requirements: 'Requirements: 3+ years of data analysis experience, proficiency in SQL and Python, experience with Tableau or similar BI tools, strong analytical thinking. Mid-level experience required.',
      salary: 'AED 8K–12K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Mobile Developer (Flutter)',
      department: 'Operations',
      location: 'Athens, Greece',
      locationType: LocationType.HYBRID,
      jobType: JobType.PART_TIME,
      description: 'Build cross-platform mobile applications using Flutter. You will work on both iOS and Android apps, collaborating with designers and backend engineers.',
      requirements: 'Requirements: 4+ years of mobile development experience, proficiency in Flutter and Dart, strong understanding of mobile UI/UX, experience with REST APIs. Senior level preferred.',
      salary: 'USD 80K–120K / year',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Marketing Manager',
      department: 'Engineering',
      location: 'Boston, United States',
      locationType: LocationType.HYBRID,
      jobType: JobType.PART_TIME,
      description: 'Lead our marketing efforts to grow brand awareness and drive customer acquisition. You will develop and execute marketing strategies across multiple channels.',
      requirements: 'Requirements: 3+ years of marketing experience, strong understanding of digital marketing, data-driven mindset, excellent leadership skills. Mid-level experience required.',
      salary: 'AED 8K–12K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Backend Developer',
      department: 'Product',
      location: 'Bangalore, India',
      locationType: LocationType.HYBRID,
      jobType: JobType.PART_TIME,
      description: 'Design and develop scalable backend systems and APIs. You will work with Node.js, PostgreSQL, and cloud technologies to build robust server-side applications.',
      requirements: 'Requirements: 4+ years of backend development experience, proficiency in Node.js or Python, strong database skills, experience with microservices architecture. Senior level preferred.',
      salary: 'USD 80K–120K / year',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Business Analyst',
      department: 'Customer Success',
      location: 'Riyadh, Saudi Arabia',
      locationType: LocationType.HYBRID,
      jobType: JobType.PART_TIME,
      description: 'Bridge the gap between business needs and technical solutions. You will gather requirements, create documentation, and work with stakeholders to drive business outcomes.',
      requirements: 'Requirements: 3+ years of business analysis experience, strong analytical skills, excellent communication abilities, experience with Agile methodologies. Mid-level experience required.',
      salary: 'USD 4K–6K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Solutions Consultant',
      department: 'Engineering',
      location: 'Hyderabad, India',
      locationType: LocationType.HYBRID,
      jobType: JobType.CONTRACT,
      description: 'Work with customers to understand their needs and propose technical solutions. You will conduct demos, create technical documentation, and support the sales team.',
      requirements: 'Requirements: 2+ years of solutions consulting experience, strong technical background, excellent presentation skills, ability to understand complex business requirements. Junior level welcome.',
      salary: 'AED 8K–12K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'QA Engineer',
      department: 'Marketing',
      location: 'Berlin, Germany',
      locationType: LocationType.HYBRID,
      jobType: JobType.CONTRACT,
      description: 'Ensure software quality through comprehensive testing. You will create test plans, perform manual and automated testing, and work with developers to resolve issues.',
      requirements: 'Requirements: 2+ years of QA experience, knowledge of testing frameworks, experience with automation tools like Selenium or Cypress, attention to detail. Junior level welcome.',
      salary: 'INR 8L–15L / year',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Technical Writer',
      department: 'Sales',
      location: 'Berlin, Germany',
      locationType: LocationType.ONSITE,
      jobType: JobType.FULL_TIME,
      description: 'Create clear and comprehensive technical documentation for our products. You will work with engineering teams to document APIs, features, and processes.',
      requirements: 'Requirements: 2+ years of technical writing experience, strong writing skills, ability to understand complex technical concepts, experience with documentation tools. Junior level welcome.',
      salary: 'SAR 10K–18K / month',
      isActive: true,
    },
    {
      companyId: company.id,
      title: 'Customer Success Executive',
      department: 'Customer Success',
      location: 'Istanbul, Turkey',
      locationType: LocationType.HYBRID,
      jobType: JobType.FULL_TIME,
      description: 'Help customers achieve success with our products. You will onboard new customers, provide training, and ensure customer satisfaction and retention.',
      requirements: 'Requirements: 2+ years of customer success experience, excellent communication skills, problem-solving abilities, empathy for customer needs. Junior level welcome.',
      salary: 'SAR 10K–18K / month',
      isActive: true,
    },
  ]

  for (const job of jobs) {
    await prisma.job.create({ data: job })
  }

  console.log('✅ Created sample jobs')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Test credentials:')
  console.log('Email: recruiter@techcorp.com')
  console.log('Password: password123')
  console.log('\n🌐 Visit: http://localhost:3000/techcorp/careers')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
