import { useState } from "react";
import { postMessages } from "./story-api";
import StoryBodyView from "./components/content-view/StoryBodyView";
import PlayerInput from "./components/player-input/PlayerInput";
import { storyConfig } from './story-config';
// import { storyConfig } from './examples/story-config-01-birdwatching';
// import { storyConfig } from './examples/story-config-02-a-late-divorce';
// import { storyConfig } from './examples/story-con fig-03-hebrew';

function App() {

    const [messages, setMessages] = useState([
        { role: 'system', content: storyConfig.instructions },
        { role: 'assistant', content: storyConfig.openingLine },
        { role: 'assistant', content: storyConfig.firstCallToAction }
    ]);
    const [apiStatus, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ended' | 'error'
    const [response, setResponse] = useState(null); // see responseSchema @ response-schema
    const [storyShouldEnd, setStoryShouldEnd] = useState(false);

    function addMessage(newMsg) {
        setMessages(currentMsgs => [...currentMsgs, newMsg])
    }

    function handleInactivity() {
        if (!response) return;

        // if (response.playerEngagement <= 0.6) {
        //     // Trigger an independent story event:
        //     addMessage({ role: 'assistant', content: response.storyEvent });
        // }
        // Apply call to action hint:
        addMessage({ role: 'assistant', content: response.callToAction });

    }

    function handleSend(playerText) {
        const newMessages = [...messages];
        newMessages.push({ role: 'user', content: playerText });
        setMessages(newMessages);

        setStatus('loading');
        postMessages(newMessages, handleResponse);
    }

    function handleResponse({ messages, response, error }) {
        if (!response || error) {
            setStatus('error');
            return;
        }
        console.log(response);
        addMessage({ role: 'assistant', content: response.storyText });

        if (storyShouldEnd) {
            setStatus('ended');
            addMessage({ role: 'assistant', content: 'הסוף.' });
            return;
        }

        setStatus('idle');
        setResponse(response);

        // console.log(res.playerSentiment);
        console.log('engagement:', response.playerEngagement);
        console.log('goal progress: ', response.goalProgress);
        console.log("dudu's frustration", response.duduFrustration);

        // Example: reacting to player sentiment:
        // if (res.playerSentiment.includes('sadness')) {
        //     addMessage({ role: 'system', content: `The following storyText should make the player laugh.` })
        // }
        // Ending conditions:

        if(response.duduFrustration >= 0.4){
            if(response.duduFrustration >= 0.7) {
                addMessage({
                    role: 'system',
                    content: `The following storyText should end the story with Dudu storming out of the meeting. 
                convey that he is now very unlikely to take the job, and try to make the player feel a little guilty about his performance.
                Use up to 50 words to write an epilogue.`
                })
                setStoryShouldEnd(true);
            }
            else
            {
                addMessage({
                    role: 'system',
                    content: `The following storyText should warn the player that dudu is getting uneasy, and might storm out.`
                })
            }
        }
        if (response.goalProgress >= 0.7) {
            addMessage({
                role: 'system',
                content: `The following storyText should end the story. Use up to 50 words to write an epilogue.
                 dudu will take the job, and will start his way towards recovery. make the player feel pride at his achievement`
            })
            setStoryShouldEnd(true);
        }
    }

    return (
        <>
            <h1>
                {storyConfig.name || 'Open Story'}
            </h1>
            <StoryBodyView apiStatus={apiStatus} messages={messages} />
            <PlayerInput
                apiStatus={apiStatus}
                onSend={handleSend}
                onInactivity={handleInactivity}
            />
        </>
    )
}

export default App