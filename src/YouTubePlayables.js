const ytgameRef = window.ytgame ?? window.parent?.ytgame;

let _firstFrameReady = false;
let _gameReady = false;
let _unsetAudioCallback = undefined;
let _language = '';

export const SDKErrorType = Object.freeze({
    UNKNOWN: 'UNKNOWN',
    API_UNAVAILABLE: 'API_UNAVAILABLE',
    INVALID_PARAMS: 'INVALID_PARAMS',
    SIZE_LIMIT_EXCEEDED: 'SIZE_LIMIT_EXCEEDED'
});

const handleError = (errorType) =>
{
    let type = null;

    switch (errorType)
    {
        case SDKErrorType.UNKNOWN:
            console.error('The error is unknown.');
            type = SDKErrorType.UNKNOWN;
            break;
        case SDKErrorType.API_UNAVAILABLE:
            console.error('The API is temporarily unavailable. Please try again later.');
            type = SDKErrorType.API_UNAVAILABLE;
            break;
        case SDKErrorType.INVALID_PARAMS:
            console.error('The API was called with invalid parameters.');
            type = SDKErrorType.INVALID_PARAMS;
            break;
        case SDKErrorType.SIZE_LIMIT_EXCEEDED:
            console.error('The API was called with parameters exceeding the size limit.');
            type = SDKErrorType.SIZE_LIMIT_EXCEEDED;
            break;
        default:
            console.error('Unhandled error type.');
    }

    return type;
};

export const YouTubePlayables = {

    isLoaded: !!ytgameRef,

    //  https://developers.google.com/youtube/gaming/playables/reference/sdk#sdk_version
    version: ytgameRef?.SDK_VERSION ?? 'unloaded',

    //  https://developers.google.com/youtube/gaming/playables/reference/sdk#in_playables_env
    inPlayablesEnv: ytgameRef?.IN_PLAYABLES_ENV,
    
    firstFrameReady: function ()
    {
        if (_firstFrameReady)
        {
            return;
        }
        else
        {
            ytgameRef?.game.firstFrameReady();

            _firstFrameReady = true;
        }
    },

    gameReady: function ()
    {
        if (!_firstFrameReady)
        {
            console.error('gameReady called before firstFrameReady.');

            return;
        }
        else
        {
            ytgameRef?.game.gameReady();

            _gameReady = true;
        }
    },

    isFirstFrameReady: function ()
    {
        return _firstFrameReady;
    },

    isGameReady: function ()
    {
        return _gameReady;
    },

    sendScore: function (score)
    {
        if (_gameReady && _inEnv)
        {
            try
            {
                ytgameRef?.engagement.sendScore({ value: score });
            }
            catch (error)
            {
                if (error.errorType)
                {
                    handleError(error.errorType);
                }
            }
        }
    },

    setOnPause: function (callback)
    {
        if (ytgameRef?.IN_PLAYABLES_ENV)
        {
            ytgameRef?.system.onPause(callback);
        }
    },

    setOnResume: function (callback)
    {
        if (ytgameRef?.IN_PLAYABLES_ENV)
        {
            ytgameRef?.system.onResume(callback);
        }
    },

    loadData: function ()
    {
        return new Promise(async (resolve, reject) =>
        {
            let data = null;
    
            if (ytgameRef?.IN_PLAYABLES_ENV)
            {
                try
                {
                    const rawdata = await ytgameRef?.game.loadData();
    
                    if (rawdata)
                    {
                        data = JSON.parse(rawdata);
                    }
                }
                catch (error)
                {
                    console.error('Failed to parse data.');

                    ytgameRef?.health.logError();

                    reject(error);
                }
            }
            
            resolve(data);
        });
    },
    
    loadLanguage: function ()
    {
        return new Promise(async (resolve) =>
        {
            if (ytgameRef?.IN_PLAYABLES_ENV)
            {
                _language = await ytgameRef?.system.getLanguage();
            }
    
            resolve(_language);
        });
    },
    
    getLanguage: function ()
    {
        return _language;
    },

    isAudioEnabled: function ()
    {
        return ytgameRef?.system.isAudioEnabled() ?? false;
    },

    setAudioChangeCallback: function (callback)
    {
        if (ytgameRef?.IN_PLAYABLES_ENV)
        {
            if (_unsetAudioCallback)
            {
                _unsetAudioCallback();
            }

            _unsetAudioCallback = ytgameRef?.system.onAudioEnabledChange(callback);
        }
    },

    unsetAudioChangeCallback: function ()
    {
        if (_unsetAudioCallback)
        {
            _unsetAudioCallback();
        }
    }
};

