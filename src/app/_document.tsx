import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Use the working demo's QZ Tray script */}
        <script src="/demo/js/qz-tray.js"></script>
        {/* Polyfills from the working demo */}
        <script src="/demo/js/sample/promise-polyfill-8.1.3.min.js"></script>
        <script src="/demo/js/sample/whatwg-fetch-3.0.0.min.js"></script>
        <script src="/demo/js/sample/padstart-pollyfill.js"></script>
        <script src="/demo/js/sample/array-from-pollyfill.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 