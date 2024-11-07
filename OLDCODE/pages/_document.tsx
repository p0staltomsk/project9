import { Html, Head, Main, NextScript } from 'next/document'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href={`${publicRuntimeConfig.basePath}/favicon.ico`} type="image/x-icon" />
        <link rel="shortcut icon" href={`${publicRuntimeConfig.basePath}/favicon.ico`} type="image/x-icon" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
