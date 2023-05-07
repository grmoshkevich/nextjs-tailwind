'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ImagesGrid = () => {
  const [imagesBySection, setImagesBySection] = useState({});
  const [db, setDb] = useState(null);

  useEffect(() => {
    retrieveImagesFromIndexedDB();
  }, []);

  const retrieveImagesFromIndexedDB = () => {
    const request = indexedDB.open('ImageDatabase', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      setDb(db);
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
      const { sectionName, id } = image;
      if (!grouped[sectionName]) {
        grouped[sectionName] = {};
      }
      grouped[sectionName][id] = { id, imageUrl: URL.createObjectURL(image.image) };
    });

    const defaultSectionNames = ["Life", "Love", "Career", "Passion", "Fulfillment", "Family", "Work", "Childhood", "Dreams"];
    for (const defaultSectionName of defaultSectionNames) {
      if (Object.entries(grouped).length >= 9) break;
      if (!grouped[defaultSectionName]) {
        grouped[defaultSectionName] = {};
      }
    }
    return grouped;
  };

  const getRandomUniqueImages = (sectionImages) => {
    const imageIds = Object.keys(sectionImages);
    const uniqueImages = { ...sectionImages };
    const randomUniqueImages = {};
  
    while (Object.keys(randomUniqueImages).length < 6 && imageIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * imageIds.length);
      const randomImageId = imageIds.splice(randomIndex, 1)[0];
      randomUniqueImages[randomImageId] = uniqueImages[randomImageId];
      delete uniqueImages[randomImageId];
    }
  
    return randomUniqueImages;
  };
  
  const renderImageOrLink = (id, imageUrl, sectionName, imageIndex) => {
    console.log('%c⧭', 'color: #d0bfff', id);
    console.log('%c⧭', 'color: #00736b', sectionName);
    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          style={{ objectFit: 'cover' }}
          fill={true}
          alt={`Image ${id ?? imageIndex}`}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, id, sectionName)}
        />
      );
    } else {
      return (
        <Link href={`/add/${sectionName}`} className="w-full h-full text-center">
          {sectionName}
        </Link>
      );
    }
  };
  
  

  const handleDrop = (e, newSectionName) => {
    console.log('%c⧭', 'color: #994d75', newSectionName);
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
    console.log('%c⧭', 'color: #7f2200', id, sectionName);
    // Set the data to be transferred during the drag operation
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.setData('text/section', sectionName);
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-screen">
      {Object.entries(imagesBySection).map(([sectionName, sectionImages], index) => {
        const randomUniqueImagesForThisSection = Object.values((getRandomUniqueImages(sectionImages)));
        const imagesOrEmpties =  Array.from({ length: 6 }, (_, index) => randomUniqueImagesForThisSection[index] ?? {});

        console.log('%c⧭', 'color: #99614d', imagesOrEmpties);
        return (
          <div key={index} className="grid grid-cols-3 grid-rows-2">
            {imagesOrEmpties.map(({ id, imageUrl }, imageIndex) => (
              <div
                key={id ?? imageIndex}
                className="flex items-center justify-center bg-gray-200 relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, sectionName)}
              >
                {renderImageOrLink(id, imageUrl, sectionName, imageIndex)}
              </div>
          ))}
        </div>)
      })}
    </div>
  );
}  

export default ImagesGrid;
