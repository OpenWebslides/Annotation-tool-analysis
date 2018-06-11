let CHANNEL = "all";
let ENABLE_LOGGING = true;
let ENABLE_OBJECT_LOGGING = false;

export function logging(message, object = null, channel = "none") {
    if(ENABLE_LOGGING === true && (CHANNEL === "all" || channel === CHANNEL || channel === "none")){
        console.log(channel + ": " +message);
        if(object !== null && ENABLE_OBJECT_LOGGING === true) console.log(object);
    }
}
