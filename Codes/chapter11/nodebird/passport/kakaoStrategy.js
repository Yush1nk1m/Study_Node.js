const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
// 1
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
// 1
// 2
    }, async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        
        try {
            const exUser = await User.findOne({
                where: { snsId: profile.id, provider: "kakao" },
            });
            if (exUser) {
                done(null, exUser);
// 2
// 3
            } else {
                const newUser = await User.create({
                    email: profile._json?.kakao_account?.email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: "kakao",
                });
                
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
// 3