import { HelperConfig, Learn2018Helper } from "thu-learn-lib";
import { CookieJar } from "tough-cookie";

let cookieJar = new CookieJar();
let helper = new Learn2018Helper({ cookieJar });

export default helper;
