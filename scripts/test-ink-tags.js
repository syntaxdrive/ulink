const fs = require('fs');
const { Story } = require('inkjs');

const json = fs.readFileSync('public/stories/ui_exam_chaos.json', 'utf8');
const story = new Story(json);

console.log('Starting story...');
let i = 0;
while (story.canContinue && i < 10) {
    const text = story.Continue();
    console.log(`[CONTINUE] Text: ${JSON.stringify(text)}`);
    console.log(`[CONTINUE] Tags: ${JSON.stringify(story.currentTags)}`);
    i++;
}
