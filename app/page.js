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

  const handleDrop = (e, newSectionName) => {
    e.preventDefault();
    const imageId = parseInt(e.dataTransfer.getData('text/plain'));
    const oldSectionName = e.dataTransfer.getData('text/section');
  
    // Update the image's section in IndexedDB
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');
  
    const getRequest = store.get(imageId);
  
    getRequest.onsuccess = (event) => {
      const image = event.target.result;
      image.sectionName = newSectionName;
      const updateRequest = store.put(image);
  
      updateRequest.onsuccess = () => {
        console.log(`Image ${imageId} moved from ${oldSectionName} to ${newSectionName}`);
        retrieveImagesFromIndexedDB(); // Refresh the grid to reflect the changes
      };
  
      updateRequest.onerror = (event) => {
        console.error(`Failed to update image ${imageId}:`, event.target.error);
      };
    };
  
    getRequest.onerror = (event) => {
      console.error(`Failed to retrieve image ${imageId}:`, event.target.error);
    };
  };

  const handleDragStart = (e, id, sectionName) => {
    // Set the data to be transferred during the drag operation
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.setData('text/section', sectionName);
  };



console.log('%c⧭', 'color: #f279ca', imagesBySection);

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
};

export default ImagesGrid;
