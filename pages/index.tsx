import type { NextPage } from 'next'
import Head from 'next/head'
import type { FormEvent } from 'react'
import { useObjectState } from 'services'
import { PlayIcon, PauseIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Spinner } from 'components'

interface State {
  url: string
  isLoading: boolean
  rate: number
  pitch: number
  isPaused: boolean
  text: string
}

const HomePage: NextPage = () => {
  const [{ url, isLoading, rate, pitch, isPaused, text }, setState, onChange] =
    useObjectState<State>({
      url: '',
      isLoading: false,
      rate: 1,
      pitch: 1,
      isPaused: false,
      text: ''
    })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      typeof SpeechSynthesisUtterance === 'undefined' ||
      typeof window.speechSynthesis === 'undefined'
    ) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.')
      return
    }

    if (!!text) {
      if (!isPaused) {
        window.speechSynthesis.pause()
      } else {
        window.speechSynthesis.resume()
      }
      setState({ isPaused: !isPaused })
      return
    }

    window.speechSynthesis.cancel()

    setState({ isLoading: true, text: '' })
    try {
      const res = await fetch('/api/scrap', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (data.success && !!data.result) {
        const speech = new SpeechSynthesisUtterance()
        speech.rate = rate
        speech.pitch = pitch
        speech.lang = 'ko-KR'
        speech.text = data.result

        window.speechSynthesis.speak(speech)
        setState({ text: data.result })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setState({ isLoading: false })
    }
  }
  return (
    <>
      <Head>
        <title>TTS by Kidow</title>
      </Head>
      <div className="mx-auto max-w-5xl py-16">
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-4 rounded-full border py-1 pr-1 pl-4"
        >
          <input
            className="flex-1 text-2xl"
            type="url"
            value={url}
            name="url"
            required
            placeholder="URL을 입력하세요."
            onChange={onChange}
            autoFocus
            autoComplete="off"
          />
          {!!url && (
            <button
              type="button"
              onClick={() => setState({ url: '', text: '' })}
            >
              <XMarkIcon className="h-5 w-5 text-neutral-400 hover:text-neutral-900" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !url}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {isLoading ? (
              <Spinner className="h-5 w-5 text-white" />
            ) : !!text ? (
              isPaused ? (
                <PlayIcon className="h-5 w-5 text-white" />
              ) : (
                <PauseIcon className="h-5 w-5 text-white" />
              )
            ) : (
              <PlayIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </form>

        <div className="mx-auto max-w-2xl">
          <div>
            <input
              type="range"
              value={rate}
              name="rate"
              onChange={onChange}
              min={0.1}
              max={10}
            />
            <span>{rate}</span>
          </div>
          <div>
            <input
              type="range"
              value={pitch}
              name="pitch"
              onChange={onChange}
              min={0}
              max={2}
            />
            <span>{pitch}</span>
          </div>
        </div>

        <div>{text}</div>
      </div>
    </>
  )
}

export default HomePage
