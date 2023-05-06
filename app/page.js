'use client';
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
        const imageBlobs = result.map((data) => URL.createObjectURL(data.image));
        setImages(imageBlobs);
      };
    };

    request.onerror = (event) => {
      console.error('Error opening ImageDatabase:', event.target.error);
    };
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-screen">
      {images.map((imageUrl, index) => (
        <div key={index} className="flex items-center justify-center bg-gray-200 relative">
          <Image src={imageUrl} style={{objectFit: "cover"}} fill={true} alt={`Image ${index}`} />
        </div>
      ))}
    </div>
  );
};

export default ImagesGrid;
