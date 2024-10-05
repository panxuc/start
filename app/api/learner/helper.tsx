import { Learn2018Helper } from "thu-learn-lib";
import { CookieJar } from "tough-cookie";

const cookieJar = new CookieJar();
const helper = new Learn2018Helper({ cookieJar });

export default helper;
