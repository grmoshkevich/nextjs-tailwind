'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ImagesGrid = () => {
  const [imagesBySection, setImagesBySection] = useState({});

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
        const groupedImages = groupImagesBySection(result);
        setImagesBySection(groupedImages);
      };
    };

    request.onerror = (event) => {
      console.error('Error opening ImageDatabase:', event.target.error);
    };
  };

  const groupImagesBySection = (images) => {
    const grouped = {};
    images.forEach((image) => {
      const { sectionName } = image;
      if (!grouped[sectionName]) {
        grouped[sectionName] = [];
      }
      grouped[sectionName].push(URL.createObjectURL(image.image));
    });

    const defaultSectionNames = ["Life", "Love", "Career", "Passion", "Fulfillment", "Family", "Work", "Childhood", "Dreams"];
    for (const defaultSectionName of defaultSectionNames) {
      if (Object.entries(grouped).length >= 9) break;
      if (!grouped[defaultSectionName]) {
        grouped[defaultSectionName] = []
      }
    }
    return grouped;
  };

  const handleDrop = (event, sectionName) => {
    event.preventDefault();
    const imageData = event.dataTransfer.getData('text/plain');
    const droppedImage = JSON.parse(imageData);
    const updatedImages = imagesBySection[sectionName].concat(droppedImage);
    const updatedImagesBySection = {
      ...imagesBySection,
      [sectionName]: updatedImages,
    };
    setImagesBySection(updatedImagesBySection);

    // Update the section of the dropped image in IndexedDB
    const request = indexedDB.open('ImageDatabase', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('images', 'readwrite');
      const objectStore = transaction.objectStore('images');
      const getImageRequest = objectStore.get(droppedImage.id);

      getImageRequest.onsuccess = (event) => {
        const imageToUpdate = event.target.result;
        imageToUpdate.sectionName = sectionName;
        const updateRequest = objectStore.put(imageToUpdate);
        updateRequest.onsuccess = () => {
          console.log('Image section updated in IndexedDB');
        };

        updateRequest.onerror = (event) => {
          console.error('Failed to update image section in IndexedDB:', event.target.error);
        };
      };

      getImageRequest.onerror = (event) => {
        console.error('Failed to retrieve image from IndexedDB:', event.target.error);
      };
    };

    request.onerror = (event) => {
      console.error('Error opening ImageDatabase:', event.target.error);
    };
  };




  return (
    <div className="grid grid-cols-3 grid-rows-3 h-screen">
      {Object.entries(imagesBySection).map(([sectionName, sectionImages], index) => (
        <div key={index} className="grid grid-cols-3 grid-rows-2">
          {[...Array(6)].map((_, imageIndex) => {
            const imageUrl = sectionImages[imageIndex];
            return (
              <div key={imageIndex} className="flex items-center justify-center bg-gray-200 relative">
                {imageUrl ? (
                  <Image src={imageUrl} style={{ objectFit: 'cover' }} fill={true} alt={`Image ${imageIndex}`} />
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
};

export default ImagesGrid;
