import { pipe } from '@kavsingh/curry-pipe'

import { createEvolver } from '~/lib/evolver'
import { rule3 } from '~/lib/rules'
import { sample, constant, defaultTo, range, noop } from '~/lib/util'
import { createRenderer as createCanvas2dRenderer } from '~/renderers/renderer-canvas2d'
import {
	createRenderer as createSvgRenderer,
	svgNs,
} from '~/renderers/renderer-svg'

import type { State } from './types'
import type { AudioApi } from '~/audio'
import type { RendererFactoryOptions, RenderFn } from '~/renderers/types'

export const createWorldsForType = (
	type: RenderType,
	container: HTMLElement,
	{
		count,
		rendererOptions,
	}: {
		count: number
		rendererOptions: RendererFactoryOptions
	},
) => {
	const createElements = createNElements(count)
	const appendElements = appendElementsToContainer(container)

	switch (type) {
		case 'canvas2d': {
			const elements = createElements(() => document.createElement('canvas'))

			appendElements(elements)

			return {
				type,
				elements,
				render: createCanvas2dRenderer(elements, rendererOptions),
			}
		}
		case 'svg': {
			const elements = createElements(() =>
				document.createElementNS(svgNs, 'svg'),
			)

			appendElements(elements)

			return {
				type,
				elements,
				render: createSvgRenderer(elements, rendererOptions),
			}
		}
		default:
			return { type, elements: [], render: noop }
	}
}

export const startWorldAnimations = (
	state: State,
	{
		worldCount,
		renderWorld,
		audio,
	}: { worldCount: number; renderWorld: RenderFn; audio: AudioApi },
) => {
	let running = true

	const selectRandomEvolver = pipe(
		constant(state.rules),
		sample,
		defaultTo(rule3),
		createEvolver,
	)
	const nextEvolver = () => state.evolver || selectRandomEvolver()
	const switchThreshold = Math.floor(state.worldDim / (worldCount * 2))

	let switchAccum = 0
	let evolver = nextEvolver()

	const update = () => {
		if (!running) return

		switchAccum = switchAccum >= switchThreshold ? 0 : switchAccum + 1
		evolver = switchAccum === 0 ? nextEvolver() : evolver
		state.world = evolver(state.world)
		audio.update(state.world)
	}

	const onFrame = () => {
		if (!running) return

		renderWorld(state.world)
		window.requestAnimationFrame(onFrame)
	}

	const updateInterval = setInterval(update, 14)
	window.requestAnimationFrame(onFrame)

	return () => {
		running = false
		clearInterval(updateInterval)
	}
}

export type RenderType = 'svg' | 'canvas2d'

const createNElements =
	(count: number) =>
	<R>(createFn: () => R) =>
		range(count).map(createFn)

const appendElementsToContainer =
	(container: HTMLElement) => (elements: Element[]) => {
		const fragment = document.createDocumentFragment()

		elements.forEach((element) => fragment.append(element))

		container.appendChild(fragment)
	}