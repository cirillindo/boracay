import React from 'react';

const ScrollingBanner: React.FC = () => {
  const greetings = [
    { text: 'Hello', className: 'font-["Pacifico"] text-[130px]' },
    { text: 'Mabuhay', className: 'font-["Londrina_Outline"] text-[160px]' },
    { text: 'Привет', className: 'font-["Pacifico"] text-[160px]' },
    { text: '你好', className: 'font-["Zhi_Mang_Xing"] text-[140px]' },
    { text: '안녕하세요', className: 'font-["Kirang_Haerang"] text-[100px]' },
    { text: 'שלום', className: 'font-["Solitreo"] text-[150px]' },
    { text: 'こんにちは', className: 'font-["Hachi_Maru_Pop"] text-[120px]' },
    { text: 'Bonjour', className: 'font-["Playpen_Sans"] text-[90px]' },
    { text: 'Guten Tag', className: 'font-["Alumni_Sans_Pinstripe"] text-[130px]' },
    { text: 'Ciao', className: 'font-["Passions_Conflict"] text-[260px]' }
  ];

  // Triple the greetings array for smoother looping
  const repeatedGreetings = [...greetings, ...greetings, ...greetings];

  return (
    <div className="scrolling-text w-full absolute top-[20vh] left-0 z-10 h-auto min-h-[200px] flex items-center">
      <div className="scrolling-text-content">
        {repeatedGreetings.map((greeting, index) => (
          <span
            key={index}
            className={`${greeting.className} text-white mx-8`}
          >
            {greeting.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;