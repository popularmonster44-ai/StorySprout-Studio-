import { Story } from "../types";

export const SAMPLE_STORIES: Story[] = [
  {
    id: "sample-dragon-fire",
    title: "Barnaby the Little Dragon",
    subtitle: "The Dragon Who Blew Sparkling Bubbles Instead of Fire",
    targetAge: "3-5",
    genre: "Fantasy",
    mainCharacter: "Barnaby the purple dragon with tiny yellow wings",
    coverImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    createdAt: Date.now() - 100000,
    themeColor: "from-purple-500 to-indigo-600",
    pages: [
      {
        pageNumber: 1,
        text: "Deep in the Whispering Mountains lived Barnaby, a cheerful little purple dragon with glossy golden scales. Barnaby loved making new friends, but he had one big secret.",
        illustrationPrompt: "A cute little purple dragon named Barnaby with tiny yellow wings sitting on a bright green mossy rock in a magical forest with giant glowing mushrooms.",
        imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 2,
        text: "While all the older dragons practiced breathing big roaring fireballs, Barnaby could only puff out tiny, shimmering rainbow bubbles that floated into the sky!",
        illustrationPrompt: "Barnaby the purple dragon puffing out colorful glowing rainbow bubbles into the sunny blue sky while other dragons watch with big smiles.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 3,
        text: "One warm summer afternoon, the forest animals threw a festival. But the sun was super hot, and everyone wished for something cool and fun to cheer them up.",
        illustrationPrompt: "Forest animals including a little rabbit, fox, and bear sitting under an oak tree enjoying a sunny forest festival.",
        imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 4,
        text: "Barnaby took a deep breath. 'Pop! Pop! Sparkle!' Out blew a million magical cold bubbles! They landed softly on the animals, showering everyone in giggles and cool sparkles.",
        illustrationPrompt: "Hundreds of sparkling magical bubbles swirling all around laughing woodland animals with Barnaby dancing happily in the center.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 5,
        text: "Everyone cheered! Barnaby realized that being different wasn't scary at all—it made him special. From that day on, he was the happiest bubble-dragon in the kingdom.",
        illustrationPrompt: "Barnaby wearing a tiny flower crown smiling proudly surrounded by cheering woodland friends under a bright rainbow.",
        imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    id: "sample-cosmic-cupcake",
    title: "Captain Penelope's Cosmic Cupcake",
    subtitle: "A Galactic Journey for the Golden Starberry",
    targetAge: "6-8",
    genre: "Space",
    mainCharacter: "Captain Penelope, a brave cat astronaut in a silver suit",
    coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    createdAt: Date.now() - 50000,
    themeColor: "from-amber-500 to-rose-500",
    pages: [
      {
        pageNumber: 1,
        text: "Captain Penelope adjusted her golden helmet and checked her rocket's glitter fuel. Today was Bake-Off Day across the Milky Way Galaxy!",
        illustrationPrompt: "A cute ginger cat astronaut wearing a shiny space suit inside a brightly lit starship cockpit with glowing buttons.",
        imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 2,
        text: "Her recipe was almost complete, but it needed one legendary ingredient: a Golden Starberry from Nebula-9, the sweetest fruit in deep space.",
        illustrationPrompt: "A floating nebula filled with sparkling purple dust and glowing yellow star-shaped berries floating in zero gravity.",
        imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 3,
        text: " Penelope steered through a friendly asteroid field made entirely of rock candy. 'Hang tight, mittens!' she laughed, dodging a chocolate meteorite.",
        illustrationPrompt: "A sleek red rocket ship zooming past swirling rock-candy asteroids and sparkling comet tails in colorful space.",
        imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80"
      },
      {
        pageNumber: 4,
        text: "With a gentle scoop, she gathered the glowing Starberry and zoomed back to the judges. Her cosmic cupcake sparkled with warm stardust, winning 1st Place!",
        illustrationPrompt: "A magnificent galactic cupcake with glowing star sprinkles and a golden berry on top, surrounded by alien judges holding 1st place ribbons.",
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
      }
    ]
  }
];
