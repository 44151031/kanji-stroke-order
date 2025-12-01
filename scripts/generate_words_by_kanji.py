#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
常用漢字2136字に対応する単語リストを自動生成するスクリプト

入力: data/kanji-joyo.json
出力: data/words-by-kanji.json

必要なライブラリ:
  pip install fugashi unidic-lite requests

使用方法:
  python scripts/generate_words_by_kanji.py
"""

import json
import os
import sys
from pathlib import Path
from collections import defaultdict

try:
    import fugashi
except ImportError:
    print("Error: fugashi がインストールされていません")
    print("以下のコマンドでインストールしてください:")
    print("  pip install fugashi unidic-lite")
    sys.exit(1)

# プロジェクトルートを取得
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

# 入出力ファイル
KANJI_JOYO_PATH = DATA_DIR / "kanji-joyo.json"
OUTPUT_PATH = DATA_DIR / "words-by-kanji.json"

# 日本語の一般的な単語リスト（サンプルデータ）
# 実際の運用では外部辞書やコーパスから取得することを推奨
SAMPLE_WORDS = [
    # 基本的な単語（学年別・頻出順）
    # 一年生配当漢字を含む単語
    ("一", "いち", "one"),
    ("一人", "ひとり", "one person"),
    ("一日", "いちにち", "one day"),
    ("一つ", "ひとつ", "one (thing)"),
    ("一月", "いちがつ", "January"),
    ("一年", "いちねん", "one year"),
    ("一番", "いちばん", "number one"),
    ("一度", "いちど", "once"),
    ("一生", "いっしょう", "lifetime"),
    ("一緒", "いっしょ", "together"),
    
    ("二", "に", "two"),
    ("二人", "ふたり", "two people"),
    ("二日", "ふつか", "second day"),
    ("二つ", "ふたつ", "two (things)"),
    ("二月", "にがつ", "February"),
    
    ("三", "さん", "three"),
    ("三人", "さんにん", "three people"),
    ("三日", "みっか", "third day"),
    ("三つ", "みっつ", "three (things)"),
    ("三月", "さんがつ", "March"),
    
    ("四", "よん", "four"),
    ("四人", "よにん", "four people"),
    ("四日", "よっか", "fourth day"),
    ("四月", "しがつ", "April"),
    
    ("五", "ご", "five"),
    ("五人", "ごにん", "five people"),
    ("五日", "いつか", "fifth day"),
    ("五月", "ごがつ", "May"),
    
    ("六", "ろく", "six"),
    ("六人", "ろくにん", "six people"),
    ("六日", "むいか", "sixth day"),
    ("六月", "ろくがつ", "June"),
    
    ("七", "なな", "seven"),
    ("七人", "しちにん", "seven people"),
    ("七日", "なのか", "seventh day"),
    ("七月", "しちがつ", "July"),
    
    ("八", "はち", "eight"),
    ("八人", "はちにん", "eight people"),
    ("八日", "ようか", "eighth day"),
    ("八月", "はちがつ", "August"),
    
    ("九", "きゅう", "nine"),
    ("九人", "きゅうにん", "nine people"),
    ("九日", "ここのか", "ninth day"),
    ("九月", "くがつ", "September"),
    
    ("十", "じゅう", "ten"),
    ("十人", "じゅうにん", "ten people"),
    ("十日", "とおか", "tenth day"),
    ("十月", "じゅうがつ", "October"),
    
    ("百", "ひゃく", "hundred"),
    ("百人", "ひゃくにん", "hundred people"),
    ("百円", "ひゃくえん", "hundred yen"),
    
    ("千", "せん", "thousand"),
    ("千人", "せんにん", "thousand people"),
    ("千円", "せんえん", "thousand yen"),
    
    ("万", "まん", "ten thousand"),
    ("一万", "いちまん", "ten thousand"),
    ("万人", "まんにん", "ten thousand people"),
    
    # 日・月・年
    ("日", "ひ", "day/sun"),
    ("日本", "にほん", "Japan"),
    ("日曜日", "にちようび", "Sunday"),
    ("毎日", "まいにち", "every day"),
    ("今日", "きょう", "today"),
    ("昨日", "きのう", "yesterday"),
    ("明日", "あした", "tomorrow"),
    ("休日", "きゅうじつ", "holiday"),
    ("祝日", "しゅくじつ", "national holiday"),
    ("平日", "へいじつ", "weekday"),
    
    ("月", "つき", "moon/month"),
    ("月曜日", "げつようび", "Monday"),
    ("毎月", "まいつき", "every month"),
    ("今月", "こんげつ", "this month"),
    ("来月", "らいげつ", "next month"),
    ("先月", "せんげつ", "last month"),
    
    ("年", "とし", "year"),
    ("今年", "ことし", "this year"),
    ("来年", "らいねん", "next year"),
    ("去年", "きょねん", "last year"),
    ("毎年", "まいとし", "every year"),
    ("新年", "しんねん", "new year"),
    
    # 火・水・木・金・土
    ("火", "ひ", "fire"),
    ("火曜日", "かようび", "Tuesday"),
    ("火事", "かじ", "fire (disaster)"),
    ("花火", "はなび", "fireworks"),
    
    ("水", "みず", "water"),
    ("水曜日", "すいようび", "Wednesday"),
    ("水道", "すいどう", "water supply"),
    ("水泳", "すいえい", "swimming"),
    ("香水", "こうすい", "perfume"),
    ("飲料水", "いんりょうすい", "drinking water"),
    
    ("木", "き", "tree/wood"),
    ("木曜日", "もくようび", "Thursday"),
    ("木材", "もくざい", "lumber"),
    ("植木", "うえき", "garden tree"),
    
    ("金", "きん", "gold/money"),
    ("金曜日", "きんようび", "Friday"),
    ("金額", "きんがく", "amount of money"),
    ("金持ち", "かねもち", "rich person"),
    ("料金", "りょうきん", "fee"),
    ("現金", "げんきん", "cash"),
    
    ("土", "つち", "soil/earth"),
    ("土曜日", "どようび", "Saturday"),
    ("土地", "とち", "land"),
    ("土産", "みやげ", "souvenir"),
    
    # 人・男・女・子
    ("人", "ひと", "person"),
    ("人間", "にんげん", "human being"),
    ("人生", "じんせい", "life"),
    ("人気", "にんき", "popularity"),
    ("大人", "おとな", "adult"),
    ("外国人", "がいこくじん", "foreigner"),
    ("日本人", "にほんじん", "Japanese person"),
    
    ("男", "おとこ", "man"),
    ("男性", "だんせい", "male"),
    ("男子", "だんし", "boy"),
    
    ("女", "おんな", "woman"),
    ("女性", "じょせい", "female"),
    ("女子", "じょし", "girl"),
    ("彼女", "かのじょ", "she/girlfriend"),
    
    ("子", "こ", "child"),
    ("子供", "こども", "children"),
    ("子犬", "こいぬ", "puppy"),
    ("息子", "むすこ", "son"),
    ("娘", "むすめ", "daughter"),
    
    # 山・川・森・林
    ("山", "やま", "mountain"),
    ("山登り", "やまのぼり", "mountain climbing"),
    ("富士山", "ふじさん", "Mt. Fuji"),
    ("火山", "かざん", "volcano"),
    
    ("川", "かわ", "river"),
    ("川岸", "かわぎし", "riverbank"),
    ("小川", "おがわ", "stream"),
    
    ("森", "もり", "forest"),
    ("森林", "しんりん", "forest"),
    
    ("林", "はやし", "grove"),
    ("林業", "りんぎょう", "forestry"),
    
    # 大・小・中・上・下・左・右
    ("大", "おお", "big"),
    ("大きい", "おおきい", "big"),
    ("大学", "だいがく", "university"),
    ("大切", "たいせつ", "important"),
    ("大丈夫", "だいじょうぶ", "alright"),
    ("大会", "たいかい", "tournament"),
    
    ("小", "しょう", "small"),
    ("小さい", "ちいさい", "small"),
    ("小学校", "しょうがっこう", "elementary school"),
    ("小説", "しょうせつ", "novel"),
    
    ("中", "なか", "middle/inside"),
    ("中学校", "ちゅうがっこう", "junior high school"),
    ("中心", "ちゅうしん", "center"),
    ("中国", "ちゅうごく", "China"),
    ("途中", "とちゅう", "on the way"),
    
    ("上", "うえ", "up/above"),
    ("上手", "じょうず", "skilled"),
    ("以上", "いじょう", "more than"),
    ("上着", "うわぎ", "jacket"),
    
    ("下", "した", "down/below"),
    ("下手", "へた", "unskilled"),
    ("以下", "いか", "less than"),
    ("地下", "ちか", "underground"),
    ("地下鉄", "ちかてつ", "subway"),
    
    ("左", "ひだり", "left"),
    ("左手", "ひだりて", "left hand"),
    ("左側", "ひだりがわ", "left side"),
    
    ("右", "みぎ", "right"),
    ("右手", "みぎて", "right hand"),
    ("右側", "みぎがわ", "right side"),
    
    # 目・耳・口・手・足
    ("目", "め", "eye"),
    ("目的", "もくてき", "purpose"),
    ("注目", "ちゅうもく", "attention"),
    ("目標", "もくひょう", "goal"),
    
    ("耳", "みみ", "ear"),
    ("耳鳴り", "みみなり", "ringing in ears"),
    
    ("口", "くち", "mouth"),
    ("入口", "いりぐち", "entrance"),
    ("出口", "でぐち", "exit"),
    ("人口", "じんこう", "population"),
    
    ("手", "て", "hand"),
    ("手紙", "てがみ", "letter"),
    ("手伝う", "てつだう", "to help"),
    ("選手", "せんしゅ", "athlete"),
    ("歌手", "かしゅ", "singer"),
    
    ("足", "あし", "foot/leg"),
    ("足音", "あしおと", "footsteps"),
    ("遠足", "えんそく", "excursion"),
    
    # 学校関連
    ("学", "がく", "study"),
    ("学校", "がっこう", "school"),
    ("学生", "がくせい", "student"),
    ("学習", "がくしゅう", "learning"),
    ("科学", "かがく", "science"),
    ("数学", "すうがく", "mathematics"),
    ("文学", "ぶんがく", "literature"),
    
    ("校", "こう", "school"),
    ("高校", "こうこう", "high school"),
    ("学校", "がっこう", "school"),
    
    ("先", "さき", "ahead/previous"),
    ("先生", "せんせい", "teacher"),
    ("先週", "せんしゅう", "last week"),
    ("先日", "せんじつ", "the other day"),
    
    ("生", "せい", "life/birth"),
    ("生活", "せいかつ", "life/living"),
    ("生徒", "せいと", "student"),
    ("誕生日", "たんじょうび", "birthday"),
    
    # 食べ物・飲み物
    ("食", "しょく", "food/eat"),
    ("食べる", "たべる", "to eat"),
    ("食事", "しょくじ", "meal"),
    ("食堂", "しょくどう", "dining hall"),
    ("朝食", "ちょうしょく", "breakfast"),
    ("昼食", "ちゅうしょく", "lunch"),
    ("夕食", "ゆうしょく", "dinner"),
    
    ("飲", "いん", "drink"),
    ("飲む", "のむ", "to drink"),
    ("飲み物", "のみもの", "beverage"),
    
    # 天気
    ("天", "てん", "heaven/sky"),
    ("天気", "てんき", "weather"),
    ("天国", "てんごく", "heaven"),
    
    ("気", "き", "spirit/air"),
    ("元気", "げんき", "healthy/energetic"),
    ("人気", "にんき", "popularity"),
    ("空気", "くうき", "air"),
    ("電気", "でんき", "electricity"),
    
    ("雨", "あめ", "rain"),
    ("雨天", "うてん", "rainy weather"),
    ("梅雨", "つゆ", "rainy season"),
    ("大雨", "おおあめ", "heavy rain"),
    
    ("雪", "ゆき", "snow"),
    ("雪だるま", "ゆきだるま", "snowman"),
    ("大雪", "おおゆき", "heavy snow"),
    
    ("風", "かぜ", "wind"),
    ("風邪", "かぜ", "cold (illness)"),
    ("台風", "たいふう", "typhoon"),
    
    ("雲", "くも", "cloud"),
    ("雲海", "うんかい", "sea of clouds"),
    
    ("空", "そら", "sky"),
    ("空港", "くうこう", "airport"),
    ("空気", "くうき", "air"),
    
    # 家・家族
    ("家", "いえ", "house/home"),
    ("家族", "かぞく", "family"),
    ("家庭", "かてい", "household"),
    ("作家", "さっか", "author"),
    
    ("父", "ちち", "father"),
    ("父親", "ちちおや", "father"),
    ("祖父", "そふ", "grandfather"),
    
    ("母", "はは", "mother"),
    ("母親", "ははおや", "mother"),
    ("祖母", "そぼ", "grandmother"),
    
    ("兄", "あに", "older brother"),
    ("兄弟", "きょうだい", "siblings"),
    
    ("姉", "あね", "older sister"),
    ("姉妹", "しまい", "sisters"),
    
    ("弟", "おとうと", "younger brother"),
    
    ("妹", "いもうと", "younger sister"),
    
    # 動詞
    ("行", "こう", "go"),
    ("行く", "いく", "to go"),
    ("旅行", "りょこう", "travel"),
    ("銀行", "ぎんこう", "bank"),
    ("行動", "こうどう", "action"),
    
    ("来", "らい", "come"),
    ("来る", "くる", "to come"),
    ("来週", "らいしゅう", "next week"),
    ("来年", "らいねん", "next year"),
    ("将来", "しょうらい", "future"),
    
    ("見", "けん", "see"),
    ("見る", "みる", "to see"),
    ("見学", "けんがく", "field trip"),
    ("意見", "いけん", "opinion"),
    
    ("聞", "ぶん", "hear"),
    ("聞く", "きく", "to hear/ask"),
    ("新聞", "しんぶん", "newspaper"),
    
    ("読", "どく", "read"),
    ("読む", "よむ", "to read"),
    ("読書", "どくしょ", "reading"),
    
    ("書", "しょ", "write"),
    ("書く", "かく", "to write"),
    ("図書館", "としょかん", "library"),
    ("辞書", "じしょ", "dictionary"),
    
    ("話", "はなし", "story/talk"),
    ("話す", "はなす", "to speak"),
    ("会話", "かいわ", "conversation"),
    ("電話", "でんわ", "telephone"),
    
    ("買", "ばい", "buy"),
    ("買う", "かう", "to buy"),
    ("買い物", "かいもの", "shopping"),
    
    ("売", "ばい", "sell"),
    ("売る", "うる", "to sell"),
    ("販売", "はんばい", "sales"),
    
    ("作", "さく", "make"),
    ("作る", "つくる", "to make"),
    ("作品", "さくひん", "work (of art)"),
    ("作業", "さぎょう", "work/task"),
    
    ("使", "し", "use"),
    ("使う", "つかう", "to use"),
    ("大使", "たいし", "ambassador"),
    
    ("持", "じ", "hold"),
    ("持つ", "もつ", "to hold"),
    ("気持ち", "きもち", "feeling"),
    
    ("待", "たい", "wait"),
    ("待つ", "まつ", "to wait"),
    ("期待", "きたい", "expectation"),
    
    ("立", "りつ", "stand"),
    ("立つ", "たつ", "to stand"),
    ("国立", "こくりつ", "national"),
    ("独立", "どくりつ", "independence"),
    
    ("座", "ざ", "sit"),
    ("座る", "すわる", "to sit"),
    ("座席", "ざせき", "seat"),
    
    ("走", "そう", "run"),
    ("走る", "はしる", "to run"),
    ("競走", "きょうそう", "race"),
    
    ("歩", "ほ", "walk"),
    ("歩く", "あるく", "to walk"),
    ("散歩", "さんぽ", "walk/stroll"),
    
    ("泳", "えい", "swim"),
    ("泳ぐ", "およぐ", "to swim"),
    ("水泳", "すいえい", "swimming"),
    
    ("飛", "ひ", "fly"),
    ("飛ぶ", "とぶ", "to fly"),
    ("飛行機", "ひこうき", "airplane"),
    
    # 形容詞
    ("新", "しん", "new"),
    ("新しい", "あたらしい", "new"),
    ("新聞", "しんぶん", "newspaper"),
    ("新年", "しんねん", "new year"),
    
    ("古", "こ", "old"),
    ("古い", "ふるい", "old"),
    ("古代", "こだい", "ancient times"),
    ("中古", "ちゅうこ", "secondhand"),
    
    ("高", "こう", "high/expensive"),
    ("高い", "たかい", "high/expensive"),
    ("高校", "こうこう", "high school"),
    ("最高", "さいこう", "the best"),
    
    ("安", "あん", "cheap/safe"),
    ("安い", "やすい", "cheap"),
    ("安全", "あんぜん", "safety"),
    ("安心", "あんしん", "relief"),
    
    ("長", "ちょう", "long"),
    ("長い", "ながい", "long"),
    ("社長", "しゃちょう", "company president"),
    ("校長", "こうちょう", "principal"),
    
    ("短", "たん", "short"),
    ("短い", "みじかい", "short"),
    ("短期", "たんき", "short term"),
    
    ("強", "きょう", "strong"),
    ("強い", "つよい", "strong"),
    ("勉強", "べんきょう", "study"),
    
    ("弱", "じゃく", "weak"),
    ("弱い", "よわい", "weak"),
    ("弱点", "じゃくてん", "weakness"),
    
    ("明", "めい", "bright"),
    ("明るい", "あかるい", "bright"),
    ("説明", "せつめい", "explanation"),
    ("発明", "はつめい", "invention"),
    
    ("暗", "あん", "dark"),
    ("暗い", "くらい", "dark"),
    ("暗記", "あんき", "memorization"),
    
    ("重", "じゅう", "heavy"),
    ("重い", "おもい", "heavy"),
    ("重要", "じゅうよう", "important"),
    
    ("軽", "けい", "light"),
    ("軽い", "かるい", "light"),
    ("軽食", "けいしょく", "light meal"),
    
    ("広", "こう", "wide"),
    ("広い", "ひろい", "wide"),
    ("広告", "こうこく", "advertisement"),
    
    ("狭", "きょう", "narrow"),
    ("狭い", "せまい", "narrow"),
    
    ("速", "そく", "fast"),
    ("速い", "はやい", "fast"),
    ("速度", "そくど", "speed"),
    
    ("遅", "ち", "slow/late"),
    ("遅い", "おそい", "slow/late"),
    ("遅刻", "ちこく", "being late"),
    
    ("暑", "しょ", "hot (weather)"),
    ("暑い", "あつい", "hot"),
    ("猛暑", "もうしょ", "extreme heat"),
    
    ("寒", "かん", "cold (weather)"),
    ("寒い", "さむい", "cold"),
    ("寒波", "かんぱ", "cold wave"),
    
    ("温", "おん", "warm"),
    ("温かい", "あたたかい", "warm"),
    ("温度", "おんど", "temperature"),
    ("温泉", "おんせん", "hot spring"),
    
    ("涼", "りょう", "cool"),
    ("涼しい", "すずしい", "cool"),
    
    # 場所・建物
    ("駅", "えき", "station"),
    ("東京駅", "とうきょうえき", "Tokyo Station"),
    
    ("店", "みせ", "store"),
    ("店員", "てんいん", "store clerk"),
    ("喫茶店", "きっさてん", "coffee shop"),
    
    ("病", "びょう", "illness"),
    ("病気", "びょうき", "illness"),
    ("病院", "びょういん", "hospital"),
    
    ("会", "かい", "meet/meeting"),
    ("会う", "あう", "to meet"),
    ("会社", "かいしゃ", "company"),
    ("会議", "かいぎ", "meeting"),
    ("社会", "しゃかい", "society"),
    
    ("社", "しゃ", "company/society"),
    ("会社", "かいしゃ", "company"),
    ("神社", "じんじゃ", "shrine"),
    
    ("工", "こう", "craft/construction"),
    ("工場", "こうじょう", "factory"),
    ("工事", "こうじ", "construction"),
    
    # 国・地域
    ("国", "くに", "country"),
    ("国際", "こくさい", "international"),
    ("外国", "がいこく", "foreign country"),
    ("中国", "ちゅうごく", "China"),
    ("韓国", "かんこく", "Korea"),
    ("米国", "べいこく", "USA"),
    
    ("東", "ひがし", "east"),
    ("東京", "とうきょう", "Tokyo"),
    ("東北", "とうほく", "Tohoku"),
    
    ("西", "にし", "west"),
    ("西洋", "せいよう", "Western"),
    ("関西", "かんさい", "Kansai"),
    
    ("南", "みなみ", "south"),
    ("南米", "なんべい", "South America"),
    
    ("北", "きた", "north"),
    ("北海道", "ほっかいどう", "Hokkaido"),
    ("東北", "とうほく", "Tohoku"),
    
    # 時間
    ("時", "とき", "time"),
    ("時間", "じかん", "time"),
    ("時計", "とけい", "clock/watch"),
    ("時代", "じだい", "era"),
    
    ("分", "ぶん", "minute/part"),
    ("十分", "じゅっぷん", "ten minutes"),
    ("自分", "じぶん", "oneself"),
    ("部分", "ぶぶん", "part"),
    
    ("秒", "びょう", "second"),
    
    ("週", "しゅう", "week"),
    ("今週", "こんしゅう", "this week"),
    ("来週", "らいしゅう", "next week"),
    ("先週", "せんしゅう", "last week"),
    ("毎週", "まいしゅう", "every week"),
    
    ("朝", "あさ", "morning"),
    ("朝食", "ちょうしょく", "breakfast"),
    ("毎朝", "まいあさ", "every morning"),
    
    ("昼", "ひる", "noon/daytime"),
    ("昼食", "ちゅうしょく", "lunch"),
    ("昼間", "ひるま", "daytime"),
    
    ("夕", "ゆう", "evening"),
    ("夕方", "ゆうがた", "evening"),
    ("夕食", "ゆうしょく", "dinner"),
    
    ("夜", "よる", "night"),
    ("夜中", "よなか", "midnight"),
    ("今夜", "こんや", "tonight"),
    
    ("春", "はる", "spring"),
    ("春休み", "はるやすみ", "spring break"),
    
    ("夏", "なつ", "summer"),
    ("夏休み", "なつやすみ", "summer vacation"),
    
    ("秋", "あき", "autumn"),
    ("秋分", "しゅうぶん", "autumn equinox"),
    
    ("冬", "ふゆ", "winter"),
    ("冬休み", "ふゆやすみ", "winter break"),
    
    # その他の重要な単語
    ("心", "こころ", "heart/mind"),
    ("心配", "しんぱい", "worry"),
    ("安心", "あんしん", "relief"),
    ("関心", "かんしん", "interest"),
    
    ("体", "からだ", "body"),
    ("体育", "たいいく", "physical education"),
    ("全体", "ぜんたい", "whole"),
    
    ("力", "ちから", "power"),
    ("努力", "どりょく", "effort"),
    ("能力", "のうりょく", "ability"),
    
    ("愛", "あい", "love"),
    ("愛情", "あいじょう", "affection"),
    ("恋愛", "れんあい", "romance"),
    
    ("友", "とも", "friend"),
    ("友達", "ともだち", "friend"),
    ("友人", "ゆうじん", "friend"),
    ("親友", "しんゆう", "best friend"),
    
    ("電", "でん", "electricity"),
    ("電話", "でんわ", "telephone"),
    ("電車", "でんしゃ", "train"),
    ("電気", "でんき", "electricity"),
    
    ("車", "くるま", "car"),
    ("自動車", "じどうしゃ", "automobile"),
    ("電車", "でんしゃ", "train"),
    
    ("道", "みち", "road/way"),
    ("道路", "どうろ", "road"),
    ("鉄道", "てつどう", "railway"),
    ("書道", "しょどう", "calligraphy"),
    ("茶道", "さどう", "tea ceremony"),
    
    ("色", "いろ", "color"),
    ("赤色", "あかいろ", "red color"),
    ("青色", "あおいろ", "blue color"),
    ("景色", "けしき", "scenery"),
    
    ("音", "おと", "sound"),
    ("音楽", "おんがく", "music"),
    ("発音", "はつおん", "pronunciation"),
    
    ("花", "はな", "flower"),
    ("花火", "はなび", "fireworks"),
    ("花見", "はなみ", "flower viewing"),
    
    ("鳥", "とり", "bird"),
    ("小鳥", "ことり", "small bird"),
    
    ("魚", "さかな", "fish"),
    ("金魚", "きんぎょ", "goldfish"),
    
    ("犬", "いぬ", "dog"),
    ("子犬", "こいぬ", "puppy"),
    
    ("猫", "ねこ", "cat"),
    ("子猫", "こねこ", "kitten"),
    
    ("牛", "うし", "cow"),
    ("牛肉", "ぎゅうにく", "beef"),
    
    ("馬", "うま", "horse"),
    ("競馬", "けいば", "horse racing"),
    
    # 抽象概念
    ("問", "もん", "question"),
    ("問題", "もんだい", "problem"),
    ("質問", "しつもん", "question"),
    
    ("答", "こたえ", "answer"),
    ("答える", "こたえる", "to answer"),
    ("回答", "かいとう", "answer"),
    
    ("意", "い", "meaning/intention"),
    ("意味", "いみ", "meaning"),
    ("意見", "いけん", "opinion"),
    ("注意", "ちゅうい", "attention/caution"),
    
    ("思", "し", "think"),
    ("思う", "おもう", "to think"),
    ("思想", "しそう", "thought/ideology"),
    
    ("考", "こう", "think"),
    ("考える", "かんがえる", "to think"),
    ("考え", "かんがえ", "thought"),
    ("参考", "さんこう", "reference"),
    
    ("知", "ち", "know"),
    ("知る", "しる", "to know"),
    ("知識", "ちしき", "knowledge"),
    ("通知", "つうち", "notification"),
    
    ("理", "り", "reason"),
    ("理由", "りゆう", "reason"),
    ("理解", "りかい", "understanding"),
    ("料理", "りょうり", "cooking"),
    
    ("解", "かい", "solve/understand"),
    ("解く", "とく", "to solve"),
    ("理解", "りかい", "understanding"),
    ("解説", "かいせつ", "explanation"),
    
    ("始", "し", "begin"),
    ("始める", "はじめる", "to begin"),
    ("開始", "かいし", "start"),
    
    ("終", "しゅう", "end"),
    ("終わる", "おわる", "to end"),
    ("終了", "しゅうりょう", "end"),
    ("最終", "さいしゅう", "final"),
    
    ("続", "ぞく", "continue"),
    ("続く", "つづく", "to continue"),
    ("続ける", "つづける", "to continue"),
    ("継続", "けいぞく", "continuation"),
    
    # 感情・状態
    ("楽", "らく", "comfort/fun"),
    ("楽しい", "たのしい", "fun"),
    ("音楽", "おんがく", "music"),
    
    ("悲", "ひ", "sad"),
    ("悲しい", "かなしい", "sad"),
    ("悲劇", "ひげき", "tragedy"),
    
    ("怒", "ど", "angry"),
    ("怒る", "おこる", "to get angry"),
    
    ("笑", "しょう", "laugh"),
    ("笑う", "わらう", "to laugh"),
    ("笑顔", "えがお", "smile"),
    
    ("泣", "きゅう", "cry"),
    ("泣く", "なく", "to cry"),
    
    # 動作・行為
    ("動", "どう", "move"),
    ("動く", "うごく", "to move"),
    ("運動", "うんどう", "exercise"),
    ("活動", "かつどう", "activity"),
    ("自動", "じどう", "automatic"),
    
    ("働", "どう", "work"),
    ("働く", "はたらく", "to work"),
    ("労働", "ろうどう", "labor"),
    
    ("休", "きゅう", "rest"),
    ("休む", "やすむ", "to rest"),
    ("休日", "きゅうじつ", "holiday"),
    ("休憩", "きゅうけい", "break"),
    
    ("遊", "ゆう", "play"),
    ("遊ぶ", "あそぶ", "to play"),
    ("遊園地", "ゆうえんち", "amusement park"),
    
    ("開", "かい", "open"),
    ("開く", "ひらく", "to open"),
    ("開始", "かいし", "start"),
    ("開発", "かいはつ", "development"),
    
    ("閉", "へい", "close"),
    ("閉じる", "とじる", "to close"),
    ("閉店", "へいてん", "store closing"),
    
    ("入", "にゅう", "enter"),
    ("入る", "はいる", "to enter"),
    ("入学", "にゅうがく", "enrollment"),
    ("入口", "いりぐち", "entrance"),
    
    ("出", "しゅつ", "exit"),
    ("出る", "でる", "to exit"),
    ("出口", "でぐち", "exit"),
    ("出発", "しゅっぱつ", "departure"),
    
    ("送", "そう", "send"),
    ("送る", "おくる", "to send"),
    ("放送", "ほうそう", "broadcast"),
    
    ("届", "とど", "deliver"),
    ("届く", "とどく", "to arrive"),
    ("届ける", "とどける", "to deliver"),
    
    ("届出", "とどけで", "notification"),
    
    ("届", "とどけ", "届出"),
    
    # 数量・程度
    ("多", "た", "many"),
    ("多い", "おおい", "many"),
    ("多数", "たすう", "majority"),
    
    ("少", "しょう", "few"),
    ("少ない", "すくない", "few"),
    ("少年", "しょうねん", "boy"),
    ("少女", "しょうじょ", "girl"),
    
    ("全", "ぜん", "all"),
    ("全部", "ぜんぶ", "all"),
    ("全体", "ぜんたい", "whole"),
    ("完全", "かんぜん", "perfect"),
    
    ("半", "はん", "half"),
    ("半分", "はんぶん", "half"),
    ("半年", "はんとし", "half year"),
    
    ("最", "さい", "most"),
    ("最高", "さいこう", "best"),
    ("最初", "さいしょ", "first"),
    ("最後", "さいご", "last"),
    ("最近", "さいきん", "recently"),
    
    ("初", "しょ", "first"),
    ("初めて", "はじめて", "for the first time"),
    ("最初", "さいしょ", "first"),
    
    ("次", "じ", "next"),
    ("次", "つぎ", "next"),
    ("次回", "じかい", "next time"),
    
    ("前", "まえ", "before/front"),
    ("以前", "いぜん", "before"),
    ("午前", "ごぜん", "morning"),
    ("名前", "なまえ", "name"),
    
    ("後", "あと", "after/behind"),
    ("以後", "いご", "after"),
    ("午後", "ごご", "afternoon"),
    ("最後", "さいご", "last"),
    
    ("今", "いま", "now"),
    ("今日", "きょう", "today"),
    ("今週", "こんしゅう", "this week"),
    ("今年", "ことし", "this year"),
    
    # 方向・位置
    ("内", "ない", "inside"),
    ("国内", "こくない", "domestic"),
    ("室内", "しつない", "indoor"),
    ("案内", "あんない", "guidance"),
    
    ("外", "がい", "outside"),
    ("外国", "がいこく", "foreign country"),
    ("海外", "かいがい", "overseas"),
    ("外出", "がいしゅつ", "going out"),
    
    ("間", "あいだ", "between"),
    ("時間", "じかん", "time"),
    ("人間", "にんげん", "human"),
    ("期間", "きかん", "period"),
    
    ("近", "きん", "near"),
    ("近い", "ちかい", "near"),
    ("最近", "さいきん", "recently"),
    ("近所", "きんじょ", "neighborhood"),
    
    ("遠", "えん", "far"),
    ("遠い", "とおい", "far"),
    ("永遠", "えいえん", "eternity"),
    
    # ビジネス・社会
    ("仕", "し", "serve"),
    ("仕事", "しごと", "work/job"),
    ("仕方", "しかた", "way/method"),
    
    ("事", "こと", "thing/matter"),
    ("事件", "じけん", "incident"),
    ("事故", "じこ", "accident"),
    ("事実", "じじつ", "fact"),
    
    ("業", "ぎょう", "business"),
    ("仕業", "しわざ", "deed"),
    ("作業", "さぎょう", "work"),
    ("産業", "さんぎょう", "industry"),
    ("企業", "きぎょう", "enterprise"),
    
    ("経", "けい", "pass through"),
    ("経済", "けいざい", "economy"),
    ("経験", "けいけん", "experience"),
    ("経営", "けいえい", "management"),
    
    ("済", "さい", "finish"),
    ("経済", "けいざい", "economy"),
    ("返済", "へんさい", "repayment"),
    
    ("政", "せい", "politics"),
    ("政治", "せいじ", "politics"),
    ("政府", "せいふ", "government"),
    
    ("法", "ほう", "law"),
    ("法律", "ほうりつ", "law"),
    ("方法", "ほうほう", "method"),
    ("文法", "ぶんぽう", "grammar"),
    
    # 自然・環境
    ("自", "じ", "self"),
    ("自分", "じぶん", "oneself"),
    ("自然", "しぜん", "nature"),
    ("自由", "じゆう", "freedom"),
    ("自動", "じどう", "automatic"),
    
    ("然", "ぜん", "nature"),
    ("自然", "しぜん", "nature"),
    ("当然", "とうぜん", "naturally"),
    ("突然", "とつぜん", "suddenly"),
    
    ("海", "うみ", "sea"),
    ("海外", "かいがい", "overseas"),
    ("日本海", "にほんかい", "Sea of Japan"),
    
    ("島", "しま", "island"),
    ("半島", "はんとう", "peninsula"),
    
    ("地", "ち", "ground/place"),
    ("地図", "ちず", "map"),
    ("地下", "ちか", "underground"),
    ("土地", "とち", "land"),
    
    ("石", "いし", "stone"),
    ("宝石", "ほうせき", "jewel"),
    
    # 教育・文化
    ("教", "きょう", "teach"),
    ("教える", "おしえる", "to teach"),
    ("教育", "きょういく", "education"),
    ("教室", "きょうしつ", "classroom"),
    ("宗教", "しゅうきょう", "religion"),
    
    ("育", "いく", "grow/raise"),
    ("教育", "きょういく", "education"),
    ("体育", "たいいく", "physical education"),
    
    ("習", "しゅう", "learn"),
    ("習う", "ならう", "to learn"),
    ("学習", "がくしゅう", "learning"),
    ("練習", "れんしゅう", "practice"),
    
    ("練", "れん", "practice"),
    ("練習", "れんしゅう", "practice"),
    ("訓練", "くんれん", "training"),
    
    ("試", "し", "try/test"),
    ("試験", "しけん", "examination"),
    ("試合", "しあい", "match/game"),
    
    ("験", "けん", "experience"),
    ("経験", "けいけん", "experience"),
    ("試験", "しけん", "examination"),
    ("実験", "じっけん", "experiment"),
    
    ("受", "じゅ", "receive"),
    ("受ける", "うける", "to receive"),
    ("受験", "じゅけん", "taking an exam"),
    
    ("合", "ごう", "fit/match"),
    ("合う", "あう", "to fit"),
    ("試合", "しあい", "match"),
    ("場合", "ばあい", "case"),
    ("組合", "くみあい", "union"),
    
    ("文", "ぶん", "sentence/writing"),
    ("文化", "ぶんか", "culture"),
    ("文学", "ぶんがく", "literature"),
    ("作文", "さくぶん", "composition"),
    
    ("化", "か", "change/transform"),
    ("文化", "ぶんか", "culture"),
    ("変化", "へんか", "change"),
    ("化学", "かがく", "chemistry"),
    
    ("歴", "れき", "history"),
    ("歴史", "れきし", "history"),
    ("経歴", "けいれき", "career"),
    
    ("史", "し", "history"),
    ("歴史", "れきし", "history"),
    ("日本史", "にほんし", "Japanese history"),
    
    # 医療・健康
    ("医", "い", "medicine"),
    ("医者", "いしゃ", "doctor"),
    ("医学", "いがく", "medical science"),
    ("医療", "いりょう", "medical care"),
    
    ("薬", "くすり", "medicine"),
    ("薬局", "やっきょく", "pharmacy"),
    
    ("痛", "つう", "pain"),
    ("痛い", "いたい", "painful"),
    ("頭痛", "ずつう", "headache"),
    
    ("熱", "ねつ", "heat/fever"),
    ("熱い", "あつい", "hot"),
    ("発熱", "はつねつ", "fever"),
    
    # 食品
    ("肉", "にく", "meat"),
    ("牛肉", "ぎゅうにく", "beef"),
    ("豚肉", "ぶたにく", "pork"),
    ("鶏肉", "とりにく", "chicken"),
    
    ("米", "こめ", "rice"),
    ("米国", "べいこく", "USA"),
    
    ("茶", "ちゃ", "tea"),
    ("お茶", "おちゃ", "tea"),
    ("茶道", "さどう", "tea ceremony"),
    ("喫茶店", "きっさてん", "coffee shop"),
    
    ("酒", "さけ", "alcohol"),
    ("日本酒", "にほんしゅ", "Japanese sake"),
    ("居酒屋", "いざかや", "Japanese pub"),
    
    # 衣服
    ("服", "ふく", "clothes"),
    ("洋服", "ようふく", "Western clothes"),
    ("和服", "わふく", "Japanese clothes"),
    
    ("着", "ちゃく", "wear/arrive"),
    ("着る", "きる", "to wear"),
    ("到着", "とうちゃく", "arrival"),
    
    # その他の頻出単語
    ("物", "もの", "thing"),
    ("買い物", "かいもの", "shopping"),
    ("食べ物", "たべもの", "food"),
    ("建物", "たてもの", "building"),
    ("荷物", "にもつ", "luggage"),
    
    ("者", "もの", "person"),
    ("医者", "いしゃ", "doctor"),
    ("学者", "がくしゃ", "scholar"),
    ("記者", "きしゃ", "journalist"),
    
    ("方", "かた", "person/way"),
    ("方法", "ほうほう", "method"),
    ("地方", "ちほう", "region"),
    ("味方", "みかた", "ally"),
    
    ("場", "ば", "place"),
    ("場所", "ばしょ", "place"),
    ("場合", "ばあい", "case"),
    ("駐車場", "ちゅうしゃじょう", "parking lot"),
    
    ("所", "ところ", "place"),
    ("場所", "ばしょ", "place"),
    ("住所", "じゅうしょ", "address"),
    ("事務所", "じむしょ", "office"),
    
    ("部", "ぶ", "part/department"),
    ("部分", "ぶぶん", "part"),
    ("全部", "ぜんぶ", "all"),
    ("部屋", "へや", "room"),
    
    ("屋", "や", "shop/house"),
    ("部屋", "へや", "room"),
    ("本屋", "ほんや", "bookstore"),
    ("花屋", "はなや", "flower shop"),
    
    ("室", "しつ", "room"),
    ("教室", "きょうしつ", "classroom"),
    ("寝室", "しんしつ", "bedroom"),
    
    ("員", "いん", "member"),
    ("会員", "かいいん", "member"),
    ("店員", "てんいん", "store clerk"),
    ("社員", "しゃいん", "employee"),
    
    ("係", "かかり", "person in charge"),
    ("関係", "かんけい", "relationship"),
    
    ("関", "かん", "relation"),
    ("関係", "かんけい", "relationship"),
    ("関心", "かんしん", "interest"),
    ("機関", "きかん", "institution"),
    
    ("係", "けい", "relate"),
    ("関係", "かんけい", "relationship"),
    
    ("特", "とく", "special"),
    ("特別", "とくべつ", "special"),
    ("特に", "とくに", "especially"),
    
    ("別", "べつ", "separate"),
    ("特別", "とくべつ", "special"),
    ("別々", "べつべつ", "separately"),
    
    ("同", "どう", "same"),
    ("同じ", "おなじ", "same"),
    ("同時", "どうじ", "simultaneous"),
    
    ("違", "い", "differ"),
    ("違う", "ちがう", "to differ"),
    ("間違い", "まちがい", "mistake"),
    
    ("変", "へん", "strange/change"),
    ("変わる", "かわる", "to change"),
    ("変化", "へんか", "change"),
    ("大変", "たいへん", "terrible/very"),
    
    ("代", "だい", "generation/substitute"),
    ("時代", "じだい", "era"),
    ("現代", "げんだい", "modern times"),
    ("代わり", "かわり", "substitute"),
    
    ("世", "せ", "world/generation"),
    ("世界", "せかい", "world"),
    ("世紀", "せいき", "century"),
    
    ("界", "かい", "world/boundary"),
    ("世界", "せかい", "world"),
    ("業界", "ぎょうかい", "industry"),
    
    ("紀", "き", "chronicle"),
    ("世紀", "せいき", "century"),
    
    ("記", "き", "record"),
    ("記事", "きじ", "article"),
    ("記録", "きろく", "record"),
    ("日記", "にっき", "diary"),
    
    ("録", "ろく", "record"),
    ("記録", "きろく", "record"),
    ("登録", "とうろく", "registration"),
    
    ("報", "ほう", "report"),
    ("報告", "ほうこく", "report"),
    ("情報", "じょうほう", "information"),
    ("天気予報", "てんきよほう", "weather forecast"),
    
    ("告", "こく", "announce"),
    ("報告", "ほうこく", "report"),
    ("広告", "こうこく", "advertisement"),
    
    ("情", "じょう", "emotion/situation"),
    ("情報", "じょうほう", "information"),
    ("感情", "かんじょう", "emotion"),
    ("事情", "じじょう", "circumstances"),
    
    ("感", "かん", "feel"),
    ("感じる", "かんじる", "to feel"),
    ("感想", "かんそう", "impression"),
    ("感謝", "かんしゃ", "gratitude"),
    
    ("想", "そう", "think/imagine"),
    ("思想", "しそう", "thought"),
    ("感想", "かんそう", "impression"),
    ("想像", "そうぞう", "imagination"),
    
    ("像", "ぞう", "image/statue"),
    ("想像", "そうぞう", "imagination"),
    ("映像", "えいぞう", "image/video"),
    
    ("映", "えい", "reflect/project"),
    ("映画", "えいが", "movie"),
    ("映像", "えいぞう", "image"),
    
    ("画", "が", "picture/plan"),
    ("映画", "えいが", "movie"),
    ("計画", "けいかく", "plan"),
    ("漫画", "まんが", "manga"),
    
    ("写", "しゃ", "copy/photograph"),
    ("写真", "しゃしん", "photograph"),
    ("写す", "うつす", "to copy"),
    
    ("真", "しん", "true"),
    ("写真", "しゃしん", "photograph"),
    ("真実", "しんじつ", "truth"),
    
    ("実", "じつ", "truth/reality"),
    ("事実", "じじつ", "fact"),
    ("実際", "じっさい", "actually"),
    ("実現", "じつげん", "realization"),
    
    ("際", "さい", "occasion"),
    ("実際", "じっさい", "actually"),
    ("国際", "こくさい", "international"),
    
    ("現", "げん", "present/appear"),
    ("現在", "げんざい", "present"),
    ("現代", "げんだい", "modern"),
    ("表現", "ひょうげん", "expression"),
    
    ("在", "ざい", "exist"),
    ("現在", "げんざい", "present"),
    ("存在", "そんざい", "existence"),
    
    ("存", "そん", "exist"),
    ("存在", "そんざい", "existence"),
    ("保存", "ほぞん", "preservation"),
    
    ("保", "ほ", "protect"),
    ("保存", "ほぞん", "preservation"),
    ("保険", "ほけん", "insurance"),
    ("保護", "ほご", "protection"),
    
    ("険", "けん", "steep/danger"),
    ("保険", "ほけん", "insurance"),
    ("危険", "きけん", "danger"),
    
    ("危", "き", "danger"),
    ("危険", "きけん", "danger"),
    ("危ない", "あぶない", "dangerous"),
    
    ("安", "あん", "safe/cheap"),
    ("安全", "あんぜん", "safety"),
    ("安心", "あんしん", "relief"),
    ("安い", "やすい", "cheap"),
    
    ("全", "ぜん", "all/whole"),
    ("安全", "あんぜん", "safety"),
    ("全部", "ぜんぶ", "all"),
    ("完全", "かんぜん", "perfect"),
    
    ("完", "かん", "complete"),
    ("完全", "かんぜん", "perfect"),
    ("完成", "かんせい", "completion"),
    
    ("成", "せい", "become/accomplish"),
    ("完成", "かんせい", "completion"),
    ("成功", "せいこう", "success"),
    ("成長", "せいちょう", "growth"),
    
    ("功", "こう", "achievement"),
    ("成功", "せいこう", "success"),
    
    ("失", "しつ", "lose"),
    ("失敗", "しっぱい", "failure"),
    ("失礼", "しつれい", "rude"),
    
    ("敗", "はい", "defeat"),
    ("失敗", "しっぱい", "failure"),
    ("勝敗", "しょうはい", "victory or defeat"),
    
    ("勝", "しょう", "win"),
    ("勝つ", "かつ", "to win"),
    ("勝利", "しょうり", "victory"),
    
    ("負", "ふ", "lose/bear"),
    ("負ける", "まける", "to lose"),
    ("負担", "ふたん", "burden"),
    
    ("戦", "せん", "war/battle"),
    ("戦争", "せんそう", "war"),
    ("挑戦", "ちょうせん", "challenge"),
    
    ("争", "そう", "compete/dispute"),
    ("戦争", "せんそう", "war"),
    ("競争", "きょうそう", "competition"),
    
    ("競", "きょう", "compete"),
    ("競争", "きょうそう", "competition"),
    ("競技", "きょうぎ", "competition"),
    
    ("技", "ぎ", "skill"),
    ("技術", "ぎじゅつ", "technology"),
    ("演技", "えんぎ", "performance"),
    
    ("術", "じゅつ", "technique"),
    ("技術", "ぎじゅつ", "technology"),
    ("芸術", "げいじゅつ", "art"),
    ("手術", "しゅじゅつ", "surgery"),
    
    ("芸", "げい", "art/skill"),
    ("芸術", "げいじゅつ", "art"),
    ("芸能", "げいのう", "entertainment"),
    
    ("能", "のう", "ability"),
    ("能力", "のうりょく", "ability"),
    ("可能", "かのう", "possible"),
    
    ("可", "か", "possible"),
    ("可能", "かのう", "possible"),
    ("許可", "きょか", "permission"),
    
    ("許", "きょ", "permit"),
    ("許可", "きょか", "permission"),
    ("許す", "ゆるす", "to permit"),
    
    ("認", "にん", "recognize"),
    ("認める", "みとめる", "to recognize"),
    ("確認", "かくにん", "confirmation"),
    
    ("確", "かく", "certain"),
    ("確認", "かくにん", "confirmation"),
    ("確実", "かくじつ", "certain"),
    ("正確", "せいかく", "accurate"),
    
    ("正", "せい", "correct"),
    ("正しい", "ただしい", "correct"),
    ("正確", "せいかく", "accurate"),
    ("正直", "しょうじき", "honest"),
    
    ("直", "ちょく", "direct/straight"),
    ("正直", "しょうじき", "honest"),
    ("直接", "ちょくせつ", "direct"),
    
    ("接", "せつ", "connect"),
    ("直接", "ちょくせつ", "direct"),
    ("接続", "せつぞく", "connection"),
    
    ("続", "ぞく", "continue"),
    ("接続", "せつぞく", "connection"),
    ("継続", "けいぞく", "continuation"),
    
    ("断", "だん", "cut/refuse"),
    ("判断", "はんだん", "judgment"),
    ("中断", "ちゅうだん", "interruption"),
    
    ("判", "はん", "judge"),
    ("判断", "はんだん", "judgment"),
    ("裁判", "さいばん", "trial"),
    
    ("決", "けつ", "decide"),
    ("決める", "きめる", "to decide"),
    ("決定", "けってい", "decision"),
    ("解決", "かいけつ", "solution"),
    
    ("定", "てい", "fix/decide"),
    ("決定", "けってい", "decision"),
    ("予定", "よてい", "schedule"),
    ("安定", "あんてい", "stability"),
    
    ("予", "よ", "beforehand"),
    ("予定", "よてい", "schedule"),
    ("予約", "よやく", "reservation"),
    ("予想", "よそう", "expectation"),
    
    ("約", "やく", "promise/approximately"),
    ("予約", "よやく", "reservation"),
    ("約束", "やくそく", "promise"),
    
    ("束", "そく", "bundle"),
    ("約束", "やくそく", "promise"),
    
    ("選", "せん", "choose"),
    ("選ぶ", "えらぶ", "to choose"),
    ("選手", "せんしゅ", "athlete"),
    ("選挙", "せんきょ", "election"),
    
    ("挙", "きょ", "raise/elect"),
    ("選挙", "せんきょ", "election"),
]


def load_joyo_kanji(filepath: str) -> list:
    """常用漢字リストを読み込む"""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_words_for_kanji(kanji_list: list, word_list: list) -> dict:
    """各漢字に対応する単語を抽出"""
    words_by_kanji = defaultdict(list)
    
    # 漢字セットを作成
    kanji_set = {k["kanji"] for k in kanji_list}
    
    for word, reading, meaning in word_list:
        for char in word:
            if char in kanji_set:
                # 重複チェック
                existing = [w for w in words_by_kanji[char] if w["word"] == word]
                if not existing:
                    words_by_kanji[char].append({
                        "word": word,
                        "reading": reading,
                        "meaning": meaning
                    })
    
    return dict(words_by_kanji)


def add_words_from_fugashi(words_by_kanji: dict, kanji_set: set):
    """fugashiで形態素解析して追加の単語を生成"""
    try:
        tagger = fugashi.Tagger()
        
        # UniDic辞書から単語を抽出するサンプルテキスト
        sample_texts = [
            "日本語を勉強しています。毎日学校に行きます。",
            "今日は天気がいいです。明日は雨かもしれません。",
            "電車で東京駅まで行きました。",
            "友達と一緒に映画を見ました。とても面白かったです。",
            "来週の試験のために図書館で勉強します。",
            "新しい本を買いました。とても興味深い内容です。",
            "週末は家族と公園で遊びました。",
            "会社の会議は午後三時から始まります。",
            "日本の文化について研究しています。",
            "健康のために毎朝運動をしています。",
        ]
        
        for text in sample_texts:
            for word in tagger(text):
                # 漢字を含む単語のみ
                surface = word.surface
                for char in surface:
                    if char in kanji_set and len(surface) >= 2:
                        # 読みを取得
                        reading = word.feature.kana if hasattr(word.feature, 'kana') and word.feature.kana else ""
                        
                        if reading:
                            existing = [w for w in words_by_kanji.get(char, []) if w["word"] == surface]
                            if not existing:
                                if char not in words_by_kanji:
                                    words_by_kanji[char] = []
                                words_by_kanji[char].append({
                                    "word": surface,
                                    "reading": reading,
                                    "meaning": ""
                                })
    except Exception as e:
        print(f"Warning: fugashi processing failed: {e}")


def main():
    # Windows console encoding fix
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    print("=" * 50)
    print("words-by-kanji.json generation script")
    print("=" * 50)
    
    # 入力ファイルの存在確認
    if not KANJI_JOYO_PATH.exists():
        print(f"Error: {KANJI_JOYO_PATH} not found")
        sys.exit(1)
    
    # 常用漢字リストを読み込み
    print(f"\n[*] Loading: {KANJI_JOYO_PATH}")
    kanji_list = load_joyo_kanji(KANJI_JOYO_PATH)
    print(f"    Loaded {len(kanji_list)} kanji")
    
    kanji_set = {k["kanji"] for k in kanji_list}
    
    # サンプル単語リストから抽出
    print("\n[*] Extracting words from sample data...")
    words_by_kanji = extract_words_for_kanji(kanji_list, SAMPLE_WORDS)
    
    # fugashiで追加の単語を生成
    print("[*] Processing with fugashi (if available)...")
    add_words_from_fugashi(words_by_kanji, kanji_set)
    
    # 各漢字の単語を頻度順（単語の長さ順）にソート
    for kanji in words_by_kanji:
        words_by_kanji[kanji].sort(key=lambda w: len(w["word"]))
    
    # 統計情報
    total_words = sum(len(words) for words in words_by_kanji.values())
    kanji_with_words = len(words_by_kanji)
    
    print(f"\n[*] Statistics:")
    print(f"    Kanji with words: {kanji_with_words} / {len(kanji_list)}")
    print(f"    Total word entries: {total_words}")
    print(f"    Average words per kanji: {total_words / kanji_with_words:.1f}")
    
    # 出力
    print(f"\n[*] Saving: {OUTPUT_PATH}")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(words_by_kanji, f, ensure_ascii=False, indent=2)
    
    print("\n[OK] Done!")
    
    # サンプル出力
    print("\n[*] Sample output:")
    sample_kanji = ["日", "水", "学", "人", "山"]
    for k in sample_kanji:
        if k in words_by_kanji:
            words = words_by_kanji[k][:5]
            word_strs = ", ".join([f"{w['word']}({w['reading']})" for w in words])
            print(f"    {k}: {word_strs}")


if __name__ == "__main__":
    main()

