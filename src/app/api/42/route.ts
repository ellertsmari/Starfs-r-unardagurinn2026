export async function GET() {
  const body = `
  _____________________________
 |  ___________________________  |
 | |                           | |
 | |  $ echo $((6 * 9))        | |
 | |  42  # only in base 13    | |
 | |                           | |
 | |  $ ./life --answer        | |
 | |  42                       | |
 | |  $ cat meaning.txt        | |
 | |  Don't Panic.             | |
 | |___________________________| |
 |_______________________________|
    _[___________]_
 __|_______________|__
 |  _____________  __|
 |_|_____________|_|

 Til hamingju! Thu fannst paskaeggid!

 The answer: 42
 "The answer to the ultimate question of life, the universe, and everything."
  — The Hitchhiker's Guide to the Galaxy, Douglas Adams

 Fun fact: In base 13, 6 x 9 = 42.
           Douglas Adams claimed this was a complete coincidence.

 Segmentation fault (core dumped)... Just kidding! Here's a cookie.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
