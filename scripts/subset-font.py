# Builds public/fonts/recursive-koe.woff2 from Recursive (Arrow Type, SIL OFL 1.1):
# upright only, weights 300 to 800, the Mono and Casual axes kept, and only the characters French and English need.
#
#   curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/recursive/Recursive%5BCASL%2CCRSV%2CMONO%2Cslnt%2Cwght%5D.ttf"
#   pip install fonttools brotli
#   python scripts/subset-font.py "Recursive[CASL,CRSV,MONO,slnt,wght].ttf" public/fonts/recursive-koe.woff2
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

src, out = sys.argv[1], sys.argv[2]
font = instancer.instantiateVariableFont(TTFont(src), {'slnt': 0, 'CRSV': 0, 'wght': (300, 800)})

# Recursive has no narrow no-break space, which French puts before ; : ! ? and %: borrow the thin space.
cmap = font.getBestCmap()
if 0x202F not in cmap and 0x2009 in cmap:
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap[0x202F] = cmap[0x2009]

chars = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [
    0x152, 0x153, 0x178,  # Œ œ Ÿ
    0x2009, 0x202F,  # thin and narrow no-break spaces
    0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x201E, 0x2026, 0x2039, 0x203A,  # dashes, quotes, ellipsis
    0x20AC, 0x2192, 0x2122,  # € → ™
]
options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
options.notdef_outline = True
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=chars)
subsetter.subset(font)
font.flavor = 'woff2'
font.save(out)

built = TTFont(out).getBestCmap()
missing = [hex(char) for char in chars if char not in built]
assert not missing, missing
