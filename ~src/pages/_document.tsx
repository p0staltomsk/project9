import { Html, Head, Main, NextScript } from 'next/document';
import getConfig from 'next/config';
import { DocumentProps } from 'next/document';
import { FC } from 'react';

const { publicRuntimeConfig } = getConfig();

const Document: FC<DocumentProps> = (): JSX.Element => {
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
  );
}

export default Document;
