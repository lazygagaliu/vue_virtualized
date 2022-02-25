const content1 = 'This is a mistake. Here, we’ll refer to some time-honored typesetting conventions, with an emphasis on readability.'
export const content2 = 'What Is The Perfect Paragraph?'
// const content3 = 'Never is this principle more pertinent than when dealing with type, the bread and butter of Web-borne communication. A well-set paragraph of text is not supposed to wow the reader; the wowing should be left to the idea or observation for which the paragraph is a vehicle. In fact, the perfect paragraph is unassuming to the point of near invisibility.'
export const contents = { content1, content2 }

export const getRandomContent = () => Math.ceil(Math.random() * 2)

const data = Array.from({ length: 30 }, (_, i) => ({
	id: i,
	content: contents[`content${getRandomContent()}`]
}))

export default data;
// console.log(data);

export const secondData = Array.from({ length: 30 }, (_, i) => ({
	id: 100 + i,
	content: contents[`content${getRandomContent()}`]
}))

export const moreData = (id) => Array.from({ length: 30 }, (_, i) => ({
	id: id + i,
	content: contents[`content${getRandomContent()}`]
}))


export const oneData = {
	id: Math.random(),
	// content: contents[`content${getRandomContent()}`]
	content: content2
}