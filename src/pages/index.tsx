import { useEffect, useState } from 'react';
import { type NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
// import { Montserrat } from 'next/font/google'
// import { signIn, signOut, useSession } from "next-auth/react";

// import { UserButton, SignIn } from "@clerk/nextjs";

import {
  // MantineProvider,
  // Image,
  rem,
  Card,
  Text,
  Title,
  Badge,
  Button,
  Group,
} from '@mantine/core'

import Image from 'next/image'

import SignInPage from '~/pages/sign-in/[[...index]]'

// import { api } from '~/utils/api'
import Header from '~/components/UIUC-Components/GlobalHeader'

import styles from 'index.module.scss';

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  // const user = userUser();
  // const router = useRouter();

  const [initialPrompt, setInitialPrompt] = useState<string>('');
  return (
    <>
      <Head>
        <title>Ramona</title>
        <meta
          name="description"
          content="The UM teaching assistant."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* "My user" login button */}
      <Header />
      {/* <header style={{ backgroundColor: '#2e026d', display: 'flex', justifyContent: 'flex-end', padding: '1em'}}>
				<UserButton
          afterSignOutUrl="/"
        />
        
        

			</header> */}
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#0E1116]">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            {/* <Link href="/"> */}
            Ramona <span className="text-[hsl(280,100%,70%)]">AI</span>
            {/* </Link> */}
          </h1>

          <Container
            size="lg"
            py="l"
            style={{ position: 'relative', minHeight: '100%' }}
          >
            <Title
              color="#57534e"
              order={2}
              variant="gradient"
              weight={800}
              // gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              gradient={{ from: 'pink', to: 'blue', deg: 45 }}
              ta="center"
              mt="md"
            >
            </Title>

          </Container>
          <input className={styles.initialPrompt} type='text' placeholder='Ask me anything about meditation' onChange={evt => setInitialPrompt(evt.target.value)}></input>
          <GotoDefaultButton prompt={initialPrompt} />

          {/* <Title color="white" order={3}>
            Explore the Different Modals
          </Title>
          <PlaygroundSelect/>
          <Title color="white" order={3}>
            Or create a new model: 
            <NewModalButton/>
          </Title> */}

        </div>

        {/* search */}
        {/* <script async src="https://cse.google.com/cse.js?cx=2616b82a523e047b2">
        </script>
        <div className="gcse-search"></div> */}
      </main>
    </>
  )
}

export default Home

import { createStyles, SimpleGrid, Container } from '@mantine/core'
import { IconGauge, IconUser, IconCookie } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { PlaygroundSelect } from '~/components/PlaygroundSelect/PlaygroundSelect';
import { useUser } from '@clerk/nextjs';
import { NewModalButton } from '~/components/NewModalButton/NewModalButton';
import { GotoDefaultButton } from '~/components/GotoDefaultButton/GotoDefaultButton';

const mockdata = [
  {
    title: 'Faster than ChatGPT, with better prompts',
    description:
      'It is said to have an IQ of 5,000 and is a math genius, and can answer any question you throw at it.',
    icon: IconGauge,
  },
  {
    title: 'Course Specific',
    description:
      'Made by your professor, with all your course materials for hyper-detailed answers.',
    icon: IconUser,
  },
  {
    title: 'Upload anything, get answers',
    description:
      'Add your own study materials and get answers from the AI. Optionally, share these with your classmates.',
    icon: IconCookie,
  },
]

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 900,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(24),
    },
  },

  description: {
    maxWidth: 600,
    margin: 'auto',

    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: 'white', //theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },

  card: {
    border: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: 'white', //theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },
}))

export function FeaturesCards() {
  const { classes, theme } = useStyles()
  const features = mockdata.map((feature) => (
    <Card
      bg="#0E1116"
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
      style={{ position: 'relative', minHeight: '100%' }}
    >
      <feature.icon size={rem(50)} stroke={2} color="#C06BF9" />
      <Text
        color="white"
        fz="lg"
        fw={500}
        className={classes.cardTitle}
        mt="md"
      >
        {feature.title}
      </Text>
      <Text style={{ color: 'white' }} fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ))

  return (
    // <Container size="lg" py="xl" style={{ position: 'relative' }}>

    <SimpleGrid
      cols={3}
      spacing="xl"
      mt={50}
      breakpoints={[{ maxWidth: 'md', cols: 1 }]}
    >
      {features}
    </SimpleGrid>
  )
}

// const AuthShowcase: React.FC = () => {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined },
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// };
