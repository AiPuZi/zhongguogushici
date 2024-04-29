// pages/_app.js
import '../styles/globals.css'; // 确保您的全局样式文件路径正确

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

