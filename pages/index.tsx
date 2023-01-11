import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback } from 'react'

interface State {}

const HomePage: NextPage = () => {
  const isURL = useCallback((url: string) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ) // fragment locator
    return pattern.test(url)
  }, [])

  const speak = (text: string) => {
    if (!text) return

    if (
      typeof SpeechSynthesisUtterance === 'undefined' ||
      typeof window.speechSynthesis === 'undefined'
    ) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.')
      return
    }

    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance()
    speech.rate = 1
    speech.pitch = 1
    speech.lang = 'ko-KR'
    speech.text = text

    window.speechSynthesis.speak(speech)
  }
  return (
    <>
      <Head>
        <title>TTS by Kidow</title>
      </Head>
      <div className="container mx-auto">
        <button onClick={() => speak('안녕하세요.')}>Speech</button>
      </div>
    </>
  )
}

export default HomePage
