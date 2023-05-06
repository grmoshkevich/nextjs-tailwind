'use client';

// pages/ImagesGrid.js

import { useEffect, useState } from 'react';
import Image from 'next/image';

const ImagesGrid = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    retrieveImagesFromIndexedDB();
  }, []);

  const retrieveImagesFromIndexedDB = () => {
    const request = indexedDB.open('ImageDatabase', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('images', 'readonly');
      const objectStore = transaction.objectStore('images');
      const getAllRequest = objectStore.getAll();

      getAllRequest.onsuccess = (event) => {
        const result = event.target.result;
        console.log('%c⧭', 'color: #d90000', result);
        setImages(result);
      };
    };

    request.onerror = (event) => {
      console.error('Error opening ImageDatabase:', event.target.error);
    };
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-screen">
      {images.map((image, index) => (
        <div key={index} className="flex items-center justify-center bg-gray-200 relative">
            {image.image}
          <Image src={image.image} alt={`Image ${index}`} width={300} height={200} />
        </div>
      ))}
    </div>
  );
};

export default ImagesGrid;
