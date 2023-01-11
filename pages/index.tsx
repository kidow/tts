import type { NextPage } from 'next'

interface State {}

const HomePage: NextPage = () => {
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
    <div className="container mx-auto">
      <button onClick={() => speak('안녕하세요.')}>Speech</button>
    </div>
  )
}

export default HomePage
