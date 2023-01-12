import type { NextPage } from 'next'
import Head from 'next/head'
import { FormEvent, useEffect } from 'react'
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

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      window.speechSynthesis.cancel()
    })
  }, [])
  return (
    <>
      <Head>
        <title>TTS by Kidow</title>
      </Head>
      <div className="mx-auto max-w-5xl space-y-4 py-16">
        <div className="mb-16 space-y-4 text-center">
          <h1 className="bg-gradient-to-r from-rose-500 to-blue-500 bg-clip-text text-5xl font-bold text-transparent">
            블로그 글을 오디오로 들어보세요.
          </h1>
          <p className="text-xl font-semibold">
            URL을 입력하면 컨텐츠를 오디오로 재생시켜 줍니다.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-4 rounded-full border border-neutral-500 py-1 pr-1 pl-4 focus-within:ring-4"
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

        <div className="mx-auto max-w-2xl py-4">
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

        <div>
          <div className="mb-2 text-lg font-semibold">가능한 블로그들</div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <img src="/brunch.png" alt="" className="h-40 rounded-xl" />
              <div className="mt-1">Brunch</div>
              <div className="text-xs text-neutral-400">
                https://brunch.co.kr/@[author]/[id]
              </div>
            </div>

            <div>
              <img
                src="/medium.png"
                alt=""
                className="h-40 rounded-xl bg-contain"
              />
              <div className="mt-1">Medium</div>
              <div className="text-xs text-neutral-400">
                https://medium.com/[author]/[title]
              </div>
            </div>
          </div>
        </div>

        <div>{text}</div>
      </div>
    </>
  )
}

export default HomePage
