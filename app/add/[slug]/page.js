'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function ImageUpload({ params }) {
  console.log('%c⧭', 'color: #ffcc00', params);
  const [images, setImages] = useState([]);
  const [sectionName, setSectionName] = useState(params.slug ?? 'Public');
  const router = useRouter();

  const handleImageUpload = (event) => {
    const fileArray = Array.from(event.target.files);
    const uploadedImages = fileArray;
    setImages((prevImages) => [...prevImages, ...uploadedImages]);
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleBack = () => {
    // Clear the input and reset the image state
    setImages([]);
    router.push('/');
  };

  const [db, setDb] = useState(null);

  // Open the IndexedDB database
  useEffect(() => {
    const openDatabase = async () => {
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        const request = indexedDB.open('ImageDatabase', 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          setDb(db);
        };

        request.onerror = (event) => {
          console.error('Failed to open the database:', event.target.error);
        };
    };

    openDatabase();
  }, []);

  const handleSave = async () => {

    const uploadedImages = await Promise.all(
      images.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
  
          reader.onloadend = () => {
            const blob = new Blob([reader.result], { type: file.type });
            resolve(blob);
          };
  
          reader.onerror = (error) => {
            reject(error);
          };
  
          reader.readAsArrayBuffer(file);
        });
      })
    );
  
    console.log('Uploaded Images:', uploadedImages);
  

    // Save images and sectionName to IndexedDB
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');


    for (const image of uploadedImages) {
      const data = { sectionName, image };
      store.add(data);
    }

    await transaction.complete;
    console.log('Images saved to IndexedDB');
    router.push('/');

  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-screen">
    {Object.entries(imagesBySection).map(([sectionName, sectionImages], index) => (
      <div key={index} className="grid grid-cols-3 grid-rows-2">
        {[...Array(6)].map((_, imageIndex) => {
          const image = sectionImages[imageIndex];
          return (
            <div
              key={image.id}
              className="flex items-center justify-center bg-gray-200 relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, sectionName)}
            >
              {image ? (
                <Image
                  src={image.imageUrl}
                  style={{ objectFit: 'cover' }}
                  fill={true}
                  alt={`Image ${imageIndex}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, image.id, sectionName)}
                />
              ) : (
                <Link href={`/add/${sectionName}`} className="w-full h-full text-center">
                  {sectionName}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    ))}
  </div>
  );
}
