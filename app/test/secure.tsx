'use client'
import useClerkSWR from './swr';

const mealSummaryApiUrl = "https://a5qvybvrc7.execute-api.eu-west-1.amazonaws.com/test"

export default function Secure() {
  const {data: summaryData, error: summaryError, isLoading: summaryLoading, isValidating: summaryValidating} = useClerkSWR(mealSummaryApiUrl);


  

  return <span>Secured {JSON.stringify(summaryData)}</span>
}