import Audio from "~/audio"
import Button from "~/components/button"
import { camera, speaker } from "~/components/icons"
import { htmlToFragment } from "~/lib/dom"
import * as rules from "~/lib/rules"
import { generateInitialWorld } from "~/lib/world"

import { saveSvgSnapshot } from "./lib/snapshot-to-svg"
import { createWorldsForType, startWorldAnimations } from "./lib/worlds"
import { addRuleThumbnails } from "./rule-thumbnails"
import { html } from "./scrolls.html"

import type { State } from "./lib/types"
import type { Component } from "~/lib/types"

const Scrolls: Component = () => {
	const worldCount = 3
	const cellDim = 2
	const worldDim = Math.min(Math.floor(window.innerWidth / worldCount), 300)
	const generationSize = Math.floor(worldDim / cellDim)
	const state: State = {
		cellDim,
		worldDim,
		rules: Object.values(rules),
		evolver: undefined,
		world: generateInitialWorld(generationSize, generationSize),
	}

	const audio = new Audio()
	const snapshotButton = Button({
		as: "button",
		content: camera,
		onClick: () => {
			saveSvgSnapshot("snapshot.svg", state)
		},
	})
	const audioButton = Button({
		as: "button",
		content: speaker,
		onClick: audio.toggle.bind(audio),
	})

	const el = htmlToFragment(html)
	const worldsContainer = el.querySelector<HTMLElement>(
		'[data-el="worlds-container"]',
	)
	const thumbnailsContainer = el.querySelector<HTMLElement>(
		'[data-el="thumbnails-container"]',
	)
	const buttonsContainer = el.querySelector<HTMLElement>(
		'[data-el="buttons-container"]',
	)

	if (!(worldsContainer && thumbnailsContainer && buttonsContainer)) {
		throw new Error("missing dom, expected worlds, thumbnails, buttons")
	}

	buttonsContainer.appendChild(snapshotButton.el)
	buttonsContainer.appendChild(audioButton.el)

	const { render: renderWorld } = createWorldsForType(
		"canvas2d",
		worldsContainer,
		{
			count: worldCount,
			rendererOptions: {
				cellDim,
				width: worldDim,
				height: worldDim,
				fillColor: "#fff",
			},
		},
	)

	worldsContainer.addEventListener("click", () => (state.evolver = undefined))

	addRuleThumbnails(
		state.rules,
		thumbnailsContainer,
		(evolver) => void (state.evolver = evolver),
	)

	const stopWorldAnimations = startWorldAnimations(state, {
		worldCount,
		renderWorld,
		audio,
	})

	async function dispose() {
		stopWorldAnimations()
		await audio.dispose()
	}

	return { el, dispose }
}

export default Scrolls
