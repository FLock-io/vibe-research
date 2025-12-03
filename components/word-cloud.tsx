"use client";

import { useEffect, useState } from "react";

interface WordData {
  text: string;
  value: number;
  color: string;
}

interface WordCloudProps {
  words: WordData[];
  onWordClick?: (word: string) => void;
}

export function WordCloud({ words, onWordClick }: WordCloudProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('word-cloud-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.min(500, container.clientWidth * 0.6),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate font sizes based on word frequency
  const maxValue = Math.max(...words.map((w) => w.value), 1);
  const minValue = Math.min(...words.map((w) => w.value), 0);
  
  const getFontSize = (value: number) => {
    const minSize = 14;
    const maxSize = 72;
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    return minSize + normalized * (maxSize - minSize);
  };

  // Simple spiral layout algorithm
  const layoutWords = () => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const positions: Array<{ word: WordData; x: number; y: number; fontSize: number }> = [];
    
    let angle = 0;
    let radius = 0;
    
    words.forEach((word, index) => {
      const fontSize = getFontSize(word.value);
      const estimatedWidth = (word.text.length * fontSize) / 2;
      
      // Spiral outward
      let x = centerX + radius * Math.cos(angle);
      let y = centerY + radius * Math.sin(angle);
      
      // Adjust position to stay in bounds
      x = Math.max(estimatedWidth / 2, Math.min(dimensions.width - estimatedWidth / 2, x));
      y = Math.max(fontSize / 2, Math.min(dimensions.height - fontSize / 2, y));
      
      positions.push({ word, x, y, fontSize });
      
      // Update spiral parameters
      angle += (Math.PI * 2) / 7; // Golden ratio-ish spacing
      radius += fontSize / 3;
    });
    
    return positions;
  };

  const positionedWords = layoutWords();

  return (
    <div id="word-cloud-container" className="w-full">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full"
        style={{ maxWidth: "100%" }}
      >
        {positionedWords.map(({ word, x, y, fontSize }, index) => (
          <text
            key={`${word.text}-${index}`}
            x={x}
            y={y}
            fontSize={fontSize}
            fontWeight={fontSize > 40 ? "bold" : fontSize > 25 ? "600" : "normal"}
            fill={word.color}
            textAnchor="middle"
            dominantBaseline="middle"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onWordClick && onWordClick(word.text)}
            style={{
              userSelect: "none",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {word.text}
            <title>{word.text} ({word.value} papers)</title>
          </text>
        ))}
      </svg>
    </div>
  );
}

