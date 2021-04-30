const defaultConfig = {
    socketUrl: 'http://localhost:5000/twitchhub'
};

export class ConfigManager {

    static getConfig = async () => {
        const f = await fetch('/config-data/config.json')
            .then((resp) => {
                if (resp.status !== 200) {
                    console.log('Could not load config.json');
                    return defaultConfig;
                }
                return resp.json();
            })
            .catch((err) => {
                console.log('Fetch error :-S', err);
            });
        console.log(f);
        return f;
    }

}

export class Environment {
    
    async getConfig() {
        const result = await ConfigManager.getConfig();
        console.log('config result', result);
        return result;
    }

    async socketUrl() {
        console.log('Getting the config');
        const x = await this.getConfig();
        return x.socketUrl;
    }

    // socketUrl: this.getConfig(); // http://localhost:5000/twitchHub';
}