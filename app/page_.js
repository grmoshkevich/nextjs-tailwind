'use client';
import { useState, useEffect } from 'react';

import Image from 'next/image'

export default function Home() {


  // useEffect(() => {
  //   const customerData = [
  //     { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  //     { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
  //   ];

  //   let db;
  //   const dBOpenRequest = indexedDB.open("localImagesDb");
  //   dBOpenRequest.onupgradeneeded = (event) => {
  //     console.log('%c⧭', 'color: #ff0000', event);
  //     const db = event.target.result;

  //     const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });
  //     objectStore.createIndex("name", "name", { unique: false });
  //     objectStore.createIndex("email", "email", { unique: true });
  //     objectStore.transaction.oncomplete = (event) => {
  //       // Store values in the newly created objectStore.
  //       const customerObjectStore = db
  //         .transaction("customers", "readwrite")
  //         .objectStore("customers");
  //       customerData.forEach((customer) => {
  //         customerObjectStore.add(customer);
  //       });
  //     };
    
  //   };


    // dBOpenRequest.onupgradeneeded = (event) => {
    //   const db = event.target.result;
    //   console.log(`Upgrading to version ${db.version}`);
    

    // request.onsuccess = (event) => {
    //   console.log('%c⧭', 'color: #ff0000', event);
    //   db = event.target.result;
    //   dBOpenRequest.onupgradeneeded = (event) => {
    //     const db = event.target.result;
    //     console.log(`Upgrading to version ${db.version}`);

        
      // const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });
      // objectStore.createIndex("name", "name", { unique: false });
      // objectStore.transaction.oncomplete = (event) => {
      //   // Store values in the newly created objectStore.
      //   const customerObjectStore = db
      //     .transaction("customers", "readwrite")
      //     .objectStore("customers");
      //   customerData.forEach((customer) => {
      //     console.log('yoy')
      //     customerObjectStore.add(customer);
      //   });
      // const transaction = db.transaction(["customers"]);
      // const objectStore = transaction.objectStore("customers");
      // const request = objectStore.get("444-44-4444");
      // request.onerror = (event) => {
      //   // Handle errors!
      // };
      // request.onsuccess = (event) => {
      //   // Do something with the request.result!
      //   console.log(`Name for SSN 444-44-4444 is ${request.result.name}`);
      // };
    // };
    // const dbName = "localImagesDb";
    // const request = window.indexedDB.open(dbName, 2);


    
    // request.onerror = (event) => {
    //   console.log('error hi')
    //   // Handle errors.
    // };
    // request.onupgradeneeded = (event) => {
    //   console.log('onupgradeneeded hi')
    //   const db = event.target.result;
      
      
    
    //   // Create an objectStore to hold information about our customers. We're
    //   // going to use "ssn" as our key path because it's guaranteed to be
    //   // unique - or at least that's what I was told during the kickoff meeting.
    //   const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });
    
    //   // Create an index to search customers by name. We may have duplicates
    //   // so we can't use a unique index.
    //   objectStore.createIndex("name", "name", { unique: false });
    
    //   // Create an index to search customers by email. We want to ensure that
    //   // no two customers have the same email, so use a unique index.
    //   objectStore.createIndex("email", "email", { unique: true });
    
    //   // Use transaction oncomplete to make sure the objectStore creation is
    //   // finished before adding data into it.
    //   objectStore.transaction.oncomplete = (event) => {
    //     // Store values in the newly created objectStore.
    //     const customerObjectStore = db
    //       .transaction("customers", "readwrite")
    //       .objectStore("customers");
    //     customerData.forEach((customer) => {
    //       customerObjectStore.add(customer);
    //     });
    //   };
    // };
  // }, []);
    

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
          retrieveImageFromIndexedDB();
        };

        request.onerror = (event) => {
          console.error('Failed to open the database:', event.target.error);
        };
    };

    openDatabase();
  }, []);
  
  const gridItems = Array(9).fill('./vercel.svg'); // Array containing the image paths

  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const blob = new Blob([reader.result], { type: file.type });
        console.log('%c⧭', 'color: #00e600', blob);
        storeImageInIndexedDB(blob);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const storeImageInIndexedDB = (blob) => {
    const request = indexedDB.open('ImageDatabase', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('image', 'image', { unique: false });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('images', 'readwrite');
      const objectStore = transaction.objectStore('images');

      const request = objectStore.add({ image: blob });

      request.onsuccess = () => {
        console.log('Image stored in IndexedDB');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  };

  const [imageData, setImageData] = useState(null);

  const retrieveImageFromIndexedDB = () => {
    const request = indexedDB.open('ImageDatabase', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('images', 'readonly');
      const objectStore = transaction.objectStore('images');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const result = event.target.result;

        if (result.length > 0) {
          console.log('%c⧭', 'color: #00a3cc', );
          const blob = result[result.length - 1].image;
          console.log('%c⧭', 'color: #aa00ff', blob);
          setImageData(URL.createObjectURL(blob));
        }
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-screen">
      {/* {gridItems.map((item, index) => (
        <div key={index} className="flex items-center justify-center bg-gray-200 relative">
          <Image src={item} fill={true} alt="Grid item" />
        </div>
      ))} */}
      {imageData && (
        <div>
          <h1>Retrieved Image:</h1>
          <Image src={imageData} alt="Retrieved image" width={300} height={200} />
        </div>
      )}
      <input onChange={handleImageUpload} type="file" className="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100
      "/>
    </div>
  )
}
