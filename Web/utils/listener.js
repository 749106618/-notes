let listenerObject = {
    collectExpertListener: [],
    expertQuestionReasonListener: [],
    questionCollectCancelListener: []
};

const addListener = function (name, func) {
    if (checkExitsListener(name)) {
        listenerObject[name].push(func);
    }
    return;
}
const invokeListener = function (name, param) {
    if (checkExitsListener(name)) {
        let oneListener = listenerObject[name];
        for (let oneFunction of oneListener) {
            oneFunction(param);
        }
    }
    return;
}

const checkExitsListener = function (name) {
    let oneListener = listenerObject[name];
    if (!oneListener) {
        console.error("listener is undefined");
        return false;
    }
    return true;
}

module.exports = {
    addListener,
    invokeListener,
    checkExitsListener
}