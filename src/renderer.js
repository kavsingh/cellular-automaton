import { last, head, groupIndecesBy, eq } from './util'

const groupActiveIndeces = groupIndecesBy(eq(1))

export function createCanvasRenderer(
    canvases,
    {
        width = 200,
        height = 200,
        cellDim = 2,
        inactiveFill = '#FFFFFF',
        activeFill = '#000000',
    } = {},
) {
    const contexts = canvases.map(canvas => canvas.getContext('2d'))
    const maxRows = Math.floor(height / cellDim)
    const clear = () =>
        contexts.forEach(context => {
            context.fillStyle = inactiveFill
            context.fillRect(0, 0, width, height)
            context.fillStyle = activeFill
        })
    const drawRow = (row, yOffset) => {
        const activeRanges = groupActiveIndeces(row)

        for (let i = 0; i < activeRanges.length; i++) {
            const current = activeRanges[i]
            const start = head(current)
            const end = last(current)

            if (start !== undefined && end !== undefined) {
                contexts.forEach(context =>
                    context.fillRect(
                        start * cellDim,
                        yOffset,
                        current.length * cellDim,
                        cellDim,
                    ),
                )
            }
        }
    }

    canvases.forEach(canvas => {
        canvas.width = width
        canvas.height = height
    })

    return state => {
        clear()
        const startIdx = Math.max(0, state.length - maxRows)
        for (let i = startIdx; i < state.length; i++) {
            drawRow(state[i], height - (state.length - i) * cellDim)
        }
    }
}
