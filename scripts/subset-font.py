# Builds the site's fonts in public/fonts/ from Recursive (Arrow Type, SIL OFL 1.1), with only the characters French and English need:
# recursive-koe.woff2 for the page, upright, weights 300 to 800, the Mono and Casual axes kept;
# recursive-casual.woff2 and recursive-mono.woff2 for the 3D tape, static at weight 450, because canvas text can't set axes.
#
#   curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/recursive/Recursive%5BCASL%2CCRSV%2CMONO%2Cslnt%2Cwght%5D.ttf"
#   pip install fonttools brotli
#   python scripts/subset-font.py "Recursive[CASL,CRSV,MONO,slnt,wght].ttf" public/fonts
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

src, out_dir = sys.argv[1], Path(sys.argv[2])

chars = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [
    0x152, 0x153, 0x178,  # Œ œ Ÿ
    0x2009, 0x202F,  # thin and narrow no-break spaces
    0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x201E, 0x2026, 0x2039, 0x203A,  # dashes, quotes, ellipsis
    0x20AC, 0x2192, 0x2122,  # € → ™
]


def build(axes, name):
    font = instancer.instantiateVariableFont(TTFont(src), {'slnt': 0, 'CRSV': 0, **axes})

    # Recursive has no narrow no-break space, which French puts before ; ! and ?. Its thin space is almost invisible,
    # so the question mark would stick to the word: borrow the no-break space.
    cmap = font.getBestCmap()
    if 0x202F not in cmap:
        for table in font['cmap'].tables:
            if table.isUnicode():
                table.cmap[0x202F] = cmap[0xA0]

    options = subset.Options()
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=chars)
    subsetter.subset(font)
    font.flavor = 'woff2'
    out = out_dir / name
    font.save(out)

    built = TTFont(out).getBestCmap()
    missing = [hex(char) for char in chars if char not in built]
    assert not missing, missing


build({'wght': (300, 800)}, 'recursive-koe.woff2')
build({'wght': 450, 'MONO': 0, 'CASL': 1}, 'recursive-casual.woff2')
build({'wght': 450, 'MONO': 1, 'CASL': 0}, 'recursive-mono.woff2')
