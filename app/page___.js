'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const BlobImage = () => {
  const blobUrl = 'blob:https://grmoshkevich-effective-carnival-w6wpvvx76rj29969-3000.preview.app.github.dev/19d98546-5997-4cd6-a921-38d4d8988210';
  const [blob, setBlob] = useState([]);


  useEffect(() => {
    async function featchBlob() {
      let blob = await fetch(blobUrl).then(r => r.blob());
      setBlob(blob)
    }
    featchBlob();
  }, [])

  return (
    <div>
      <h1>Displaying Blob Image</h1>
      {blob && <Image src={blob} alt="Blob Image" width={300} height={200} />}
    </div>
  );
};

export default BlobImage;
