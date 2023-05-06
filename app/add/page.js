'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageUpload() {
  const [images, setImages] = useState([]);
  const [sectionName, setSectionName] = useState('Public');

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

  const handleCancel = () => {
    // Clear the input and reset the image state
    setImages([]);
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
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Image Upload</h1>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Section Name:</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
          disabled
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Upload Images:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
        />
        {images.length > 0 && (
          <div className="flex flex-col space-y-2 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img src={URL.createObjectURL(image)} alt={`Uploaded Image ${index}`} className="max-w-full h-auto rounded" />
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  onClick={() => handleDeleteImage(index)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 mr-2 text-white bg-red-500 rounded hover:bg-red-600"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
