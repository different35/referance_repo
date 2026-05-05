import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface ComponentSpec {
  name: string;
  description: string;
  props?: Record<string, string>;
  events?: string[];
  children?: string;
}

async function generateComponent(spec: ComponentSpec): Promise<string> {
  const prompt = `You are a Vue 3 + TypeScript + PrimeVue component expert.

Generate a Vue 3 SFC (Single File Component) for: ${spec.name}

Description: ${spec.description}

${spec.props ? `Props:\n${Object.entries(spec.props).map(([k, v]) => `- ${k}: ${v}`).join("\n")}` : ""}

${spec.events ? `Events:\n${spec.events.map((e) => `- @${e}`).join("\n")}` : ""}

${spec.children ? `Children/Slots: ${spec.children}` : ""}

Requirements:
1. Use <script setup lang="ts"> with defineProps and defineEmits
2. Use PrimeVue components (Button, DataTable, InputText, etc.)
3. Use Tailwind CSS for styling
4. Add TypeScript types for all props and emits
5. Make it responsive (mobile-first)
6. Include proper accessibility (labels, aria attributes)
7. Return ONLY the component code (single-file .vue format)
8. Use relative imports (composables, types)

Follow Vue 3 composition API best practices.`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((c) => c.type === "text")
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("");
}

async function main() {
  console.log("🎨 Component Agent - Generating Vue components\n");

  const components: ComponentSpec[] = [
    {
      name: "ActivityCard",
      description:
        "Display activity status with badge, start/stop buttons, state indicators",
      props: {
        activity: "Activity object with { id, name, state, startedAt, error }",
        loading: "boolean - disable buttons during state transition",
      },
      events: ["start", "stop", "details"],
    },
    {
      name: "ActivityStateChip",
      description: "Color-coded state indicator (idle=gray, starting=yellow, running=green, stopped=red, error=red)",
      props: {
        state: "ActivityState enum",
        error: "string | null",
      },
    },
    {
      name: "LiveTerminal",
      description:
        "Terminal output using xterm.js with support for ANSI colors, mobile responsive",
      props: {
        activityId: "string - for fetching live output subscription",
        height: "string - CSS height (default: 400px)",
      },
      events: ["input"],
      children: "Terminal input handled via WebSocket",
    },
    {
      name: "ProxyToggle",
      description:
        "Toggle proxy on/off for an activity with visual indicator",
      props: {
        activity: "Activity with proxy_profile_id",
        profiles: "ProxyProfile[]",
        loading: "boolean",
      },
      events: ["toggle"],
    },
    {
      name: "ActivityControls",
      description:
        "Button group for activity control (Start, Stop, Report, Proxy Toggle)",
      props: {
        activity: "Activity",
        loading: "boolean",
      },
      events: ["start", "stop", "report", "proxyToggle"],
    },
  ];

  for (const component of components) {
    try {
      console.log(`Generating ${component.name}.vue...\n`);
      const code = await generateComponent(component);

      console.log(code);
      console.log("\n" + "=".repeat(60) + "\n");
    } catch (error) {
      console.error(`❌ Failed to generate ${component.name}:`, error);
    }
  }

  console.log("📝 Next steps:");
  console.log("1. Create components in packages/web/src/components/");
  console.log("2. Import in pages and layouts");
  console.log("3. Install PrimeVue: npm install primevue");
  console.log("4. Test in browser with HMR\n");
}

main();
