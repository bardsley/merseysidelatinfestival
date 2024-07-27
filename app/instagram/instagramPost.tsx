'use client'
import { InstagramEmbed } from 'react-social-media-embed';
import { useState, useEffect } from'react';

export const InstagramPost = ({code}) => {
  const [isLoaded,setIsLoaded] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  },[])

  return isLoaded && <><InstagramEmbed url={`https://www.instagram.com/p/${code}/`} width={328} />
      {`${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}|${process.env.NEXT_PUBLIC_INSTAGRAM_APP_CLIENT_TOKEN}`}
  </>
}

