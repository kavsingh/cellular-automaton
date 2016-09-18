import test from 'ava'
import {
    last,
    head,
    range,
    mod,
    seedSingle,
    seedRandom,
    pipe,
    adjacentByIndex,
    take,
    sample,
} from './util.js'

test('samples a value from array', t => {
    t.plan(2)
    
    const source = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const sampled = (new Array(100)).fill(0).map(() => sample(source))
    const sampledCustom = (new Array(10)).fill(0).map(
        () => sample(source, () => 0.5))
    
    t.is(true, sampled.every(v => source.indexOf(v) !== -1))
    t.is(true, sampledCustom.every(v => v === 5))
})

test('creates an array with random 0 and 1', t => {
    t.plan(1)

    const result = seedRandom(1000)

    t.is(false, result.some(r => r !== 1 && r !== 0))
})

test('gets last element of an array', t => {
    t.plan(3)

    t.is(last([]), undefined)
    t.is(last([1]), 1)
    t.is(last([1, 2]), 2)
})

test('take n elements from start of array', t => {
    t.plan(3)
    t.deepEqual(take(2)([]), [])
    t.deepEqual(take(2)([1]), [1])
    t.deepEqual(take(2)([1, 2, 3]), [1, 2])
})

test('take n elements from end of array', t => {
    t.plan(3)
    t.deepEqual(take(-2)([]), [])
    t.deepEqual(take(-2)([1]), [1])
    t.deepEqual(take(-2)([1, 2, 3]), [2, 3])
})

test('gets first element of an array', t => {
    t.plan(3)

    t.is(head([]), undefined)
    t.is(head([1]), 1)
    t.is(head([1, 2]), 1)
})

test('groups adjacent indeces of specified value in array', t => {
    t.plan(3)

    t.deepEqual(adjacentByIndex(1)([0, 2, 3, 5, 6, 0]), [])
    t.deepEqual(adjacentByIndex(1)([0, 1, 0, 1, 1, 0]), [[1], [3, 4]])
    t.deepEqual(adjacentByIndex(1)([1, 1, 0, 1, 0, 1]), [[0, 1], [3], [5]])
})

test('creates a range of values', t => {
    t.plan(2)
    t.deepEqual(range(10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    t.deepEqual(range(0), [])
})

test('implements negative mod correctly', t => {
    t.plan(4)
    t.is(0, mod(3, 3))
    t.is(0, mod(-3, 3))
    t.is(2, mod(2, 3))
    t.is(1, mod(-2, 3))
})

test('create a single active value in the center of an n-length array', t => {
    t.plan(5)

    t.deepEqual(seedSingle(5), [0, 0, 1, 0, 0])
    t.deepEqual(seedSingle(6), [0, 0, 1, 0, 0, 0])
    t.deepEqual(seedSingle(1), [1])
    t.deepEqual(seedSingle(2), [1, 0])
    t.deepEqual(seedSingle(0), [])
})

test('compose functions left to right', t => {
    t.plan(1)

    const fn1 = (a, b) => a + b
    const fn2 = x => x * 2
    const fn = pipe(fn1, fn2)

    t.is(fn(1, 2), 6)
})
