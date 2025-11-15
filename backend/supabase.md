Getting Started with Edge Functions

Learn how to create, test, and deploy your first Edge Function using the Supabase CLI.

Before getting started, make sure you have the Supabase CLI installed. Check out the CLI installation guide for installation methods and troubleshooting.

Prefer using the Supabase Dashboard?
You can also create and deploy functions directly from the Supabase Dashboard. Check out our Dashboard Quickstart guide.

Step 1: Create or configure your project#
If you don't have a project yet, initialize a new Supabase project in your current directory.

supabase init my-edge-functions-project
cd my-edge-functions-project
Or, if you already have a project locally, navigate to your project directory. If your project hasn't been configured for Supabase yet, make sure to run the supabase init command.

cd your-existing-project
supabase init # Initialize Supabase, if you haven't already
After this step, you should have a project directory with a supabase folder containing config.toml and an empty functions directory.

Step 2: Create your first function#
Within your project, generate a new Edge Function with a basic template:

supabase functions new hello-world
This creates a new function at supabase/functions/hello-world/index.ts with this starter code:

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
})
This function accepts a JSON payload with a name field and returns a greeting message.

After this step, you should have a new file at supabase/functions/hello-world/index.ts containing the starter Edge Function code.

Step 3: Test your function locally#
Start the local development server to test your function:

supabase start  # Start all Supabase services
supabase functions serve hello-world
First time running Supabase services?
The supabase start command downloads Docker images, which can take a few minutes initially.

Function not starting locally?

Make sure Docker is running
Run supabase stop then supabase start to restart services
Port already in use?

Check what's running with supabase status
Stop other Supabase instances with supabase stop
Your function is now running at http://localhost:54321/functions/v1/hello-world. Hot reloading is enabled, which means that the server will automatically reload when you save changes to your function code.

After this step, you should have all Supabase services running locally, and your Edge Function serving at the local URL. Keep these terminal windows open.

Step 4: Send a test request#
Open a new terminal and test your function with curl:

Need your SUPABASE_PUBLISHABLE_KEY?

Run supabase status to see your local anon key and other credentials.

curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer SUPABASE_PUBLISHABLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
After running this curl command, you should see:

{ "message": "Hello Functions!" }
You can also try different inputs. Change "Functions" to "World" in the curl command and run it again to see the response change.

After this step, you should have successfully tested your Edge Function locally and received a JSON response with your greeting message.

Step 5: Connect to your Supabase project#
To deploy your function globally, you need to connect your local project to a Supabase project.

Need to create new Supabase project?
Create one at database.new.

First, login to the CLI if you haven't already, and authenticate with Supabase. This opens your browser to authenticate with Supabase; complete the login process in your browser.

supabase login
Next, list your Supabase projects to find your project ID:

supabase projects list
Next, copy your project ID from the output, then connect your local project to your remote Supabase project. Replace YOUR_PROJECT_ID with the ID from the previous step.

supabase link --project-ref [YOUR_PROJECT_ID]
After this step, you should have your local project authenticated and linked to your remote Supabase project. You can verify this by running supabase status.

Step 6: Deploy to production#
Deploy your function to Supabase's global edge network:

supabase functions deploy hello-world
# If you want to deploy all functions, run the `deploy` command without specifying a function name:
supabase functions deploy
Docker not required
The CLI automatically falls back to API-based deployment if Docker isn't available. You can also explicitly use API deployment with the --use-api flag:

supabase functions deploy hello-world --use-api
If you want to skip JWT verification, you can add the --no-verify-jwt flag for webhooks that don't need authentication:

supabase functions deploy hello-world --no-verify-jwt
Security Warning
Use --no-verify-jwt carefully. It allows anyone to invoke your function without authentication!

When the deployment is successful, your function is automatically distributed to edge locations worldwide.

Now, you should have your Edge Function deployed and running globally at https://[YOUR_PROJECT_ID].supabase.co/functions/v1/hello-world.

Step 7: Test your live function#
🎉 Your function is now live! Test it with your project's anon key:

curl --request POST 'https://[YOUR_PROJECT_ID].supabase.co/functions/v1/hello-world' \
  --header 'Authorization: Bearer SUPABASE_PUBLISHABLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Production"}'
Expected response:

{ "message": "Hello Production!" }
Production vs Development Keys
The SUPABASE_PUBLISHABLE_KEY is different in development and production. To get your production anon key, you can find it in your Supabase dashboard under Settings > API.

Finally, you should have a fully deployed Edge Function that you can call from anywhere in the world.

Usage#
Now that your function is deployed, you can invoke it from within your app:


Supabase Client

Fetch API
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://[YOUR_PROJECT_ID].supabase.co', 'YOUR_ANON_KEY')
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'JavaScript' },
})
console.log(data) // { message: "Hello JavaScript!" }


Edge Functions Architecture

Understanding the Architecture of Supabase Edge Functions

This guide explains the architecture and inner workings of Supabase Edge Functions, based on the concepts demonstrated in the video "Supabase Edge Functions Explained". Edge functions are serverless compute resources that run at the edge of the network, close to users, enabling low-latency execution for tasks like API endpoints, webhooks, and real-time data processing. This guide breaks down Edge Functions into key sections: an example use case, deployment process, global distribution, and execution mechanics.

1. Understanding Edge Functions through an example: Image filtering#
To illustrate how edge functions operate, consider a photo-sharing app where users upload images and apply filters (e.g., grayscale or sepia) before saving them.

Workflow Overview:

A user uploads an original image to Supabase Storage.
When the user selects a filter, the client-side app (using the Supabase JavaScript SDK) invokes an edge function named something like "apply-filter."
The edge function:
Downloads the original image from Supabase Storage.
Applies the filter using a library like ImageMagick.
Uploads the processed image back to Storage.
Returns the path to the filtered image to the client.
Why Edge Functions?:

They handle compute-intensive tasks without burdening the client device or the database.
Execution happens server-side but at the edge, ensuring speed and scalability.
Developers define the function in a simple JavaScript file within the Supabase functions directory.
This example highlights edge functions as lightweight, on-demand code snippets that integrate seamlessly with Supabase services like Storage and Auth.

2. Deployment process#
Deploying an edge function is straightforward and automated, requiring no manual server setup.

Steps to Deploy:

Write the function code in your local Supabase project (e.g., in supabase/functions/apply-filter/index.ts).
Run the command supabase functions deploy apply-filter via the Supabase CLI.
The CLI bundles the function and its dependencies into an ESZip file—a compact format created by Deno that includes a complete module graph for quick loading and execution.
The bundled file is uploaded to Supabase's backend.
Supabase generates a unique URL for the function, making it accessible globally.
Key Benefits of Deployment:

Automatic handling of dependencies and bundling.
No need to manage infrastructure; Supabase distributes the function across its global edge network.
Once deployed, the function is ready for invocation from anywhere, with Supabase handling scaling and availability.

3. Global distribution and routing#
Edge functions leverage a distributed architecture to minimize latency by running code close to the user.

Architecture Components:

Global API Gateway: Acts as the entry point for all requests. It uses the requester's IP address to determine geographic location and routes the request to the nearest edge location (e.g., routing a request from Amsterdam to Frankfurt).
Edge Locations: Supabase's network of data centers worldwide where functions are replicated. The ESZip bundle is automatically distributed to these locations upon deployment.
Routing Logic: Based on geolocation mapping, ensuring the function executes as close as possible to the user for optimal performance.
How Distribution Works:

Post-deployment, the function is propagated to all edge nodes.
This setup eliminates the need for developers to configure CDNs or regional servers manually.
This global edge network is what makes edge functions "edge-native," providing consistent performance regardless of user location.

4. Execution mechanics: Fast and isolated#
The core of edge functions' efficiency lies in their execution environment, which prioritizes speed, isolation, and scalability.

Request Handling:

A client sends an HTTP request (e.g., POST) to the function's URL, including parameters like auth headers, image ID, and filter type.
The global API gateway routes it to the nearest edge location.
At the edge, Supabase's edge runtime validates the request (e.g., checks authorization).
Execution Environment:

A new V8 isolate is spun up for each invocation. V8 is the JavaScript engine used by Chrome and Node.js, providing a lightweight, sandboxed environment.
Each isolate has its own memory heap and execution thread, ensuring complete isolation—no interference between concurrent requests.
The ESZip bundle is loaded into the isolate, and the function code runs.
After execution, the response (e.g., filtered image path) is sent back to the client.
Performance Optimizations:

Cold Starts: Even initial executions are fast (milliseconds) due to the compact ESZip format and minimal Deno runtime overhead.
Warm Starts: Isolates can remain active for a period (plan-dependent) to handle subsequent requests without restarting.
Concurrency: Multiple isolates can run simultaneously in the same edge location, supporting high traffic.
Isolation and Security:

Isolates prevent side effects from one function affecting others, enhancing reliability.
No persistent state; each run is stateless, ideal for ephemeral tasks.
Compared to traditional serverless or monolithic architectures, this setup offers lower latency, automatic scaling, and no infrastructure management, making it perfect for global apps.

Benefits and use cases#
Advantages:

Low Latency: Proximity to users reduces round-trip times.
Scalability: Handles variable loads without provisioning servers.
Developer-Friendly: Focus on code; Supabase manages the rest.
Cost-Effective: Pay-per-use model, with fast execution minimizing costs.
Common Use Cases:

Real-time data transformations (e.g., image processing).
API integrations and webhooks.
Personalization and A/B testing at the edge.


Integrating With Supabase Auth

Integrate Supabase Auth with Edge Functions

Edge Functions work seamlessly with Supabase Auth.

This allows you to:

Automatically identify users through JWT tokens
Enforce Row Level Security policies
Seamlessly integrate with your existing auth flow
Setting up auth context#
When a user makes a request to an Edge Function, you can use the Authorization header to set the Auth context in the Supabase client and enforce Row Level Security policies.

import { createClient } from 'npm:@supabase/supabase-js@2'
Deno.serve(async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );
  //...
})
Importantly, this is done inside the Deno.serve() callback argument, so that the Authorization header is set for each individual request!

Fetching the user#
By getting the JWT from the Authorization header, you can provide the token to getUser() to fetch the user object to obtain metadata for the logged in user.

Deno.serve(async (req: Request) => {
  // ...
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  const { data } = await supabaseClient.auth.getUser(token)
  // ...
})
Row Level Security#
After initializing a Supabase client with the Auth context, all queries will be executed with the context of the user. For database queries, this means Row Level Security will be enforced.

import { createClient } from 'npm:@supabase/supabase-js@2'
Deno.serve(async (req: Request) => {
  // ...
  // This query respects RLS - users only see rows they have access to
  const { data, error } = await supabaseClient.from('profiles').select('*');
  if (error) {
    return new Response('Database error', { status: 500 })
  }
  // ...
})
Example#
See the full example on GitHub.

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'npm:supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
console.log(`Function "select-from-table-with-auth-rls" up and running!`)
Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    // First get the token from the Authorization header
    const token = req.headers.get('Authorization').replace('Bearer ', '')
    // Now we can get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token)
    // And we can run queries in the context of our authenticated user
    const { data, error } = await supabaseClient.from('users').select('*')
    if (error) throw error
    return new Response(JSON.stringify({ user, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/select-from-table-with-auth-rls' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'


Integrating with Supabase Database (Postgres)

Connect to your Postgres database from Edge Functions.

Connect to your Postgres database from an Edge Function by using the supabase-js client.
You can also use other Postgres clients like Deno Postgres

Using supabase-js#
The supabase-js client handles authorization with Row Level Security and automatically formats responses as JSON. This is the recommended approach for most applications:

import { createClient } from 'npm:@supabase/supabase-js@2'
Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data, error } = await supabase.from('countries').select('*')
    if (error) {
      throw error
    }
    return new Response(JSON.stringify({ data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
This enables:

Automatic Row Level Security enforcement
Built-in JSON serialization
Consistent error handling
TypeScript support for database schema
Using a Postgres client#
Because Edge Functions are a server-side technology, it's safe to connect directly to your database using any popular Postgres client. This means you can run raw SQL from your Edge Functions.

Here is how you can connect to the database using Deno Postgres driver and run raw SQL. Check out the full example.

import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
// Create a database pool with one connection.
const pool = new Pool(
  {
    tls: { enabled: false },
    database: 'postgres',
    hostname: Deno.env.get('DB_HOSTNAME'),
    user: Deno.env.get('DB_USER'),
    port: 6543,
    password: Deno.env.get('DB_PASSWORD'),
  },
  1
)
Deno.serve(async (_req) => {
  try {
    // Grab a connection from the pool
    const connection = await pool.connect()
    try {
      // Run a query
      const result = await connection.queryObject`SELECT * FROM animals`
      const animals = result.rows // [{ id: 1, name: "Lion" }, ...]
      // Encode the result as pretty printed JSON
      const body = JSON.stringify(
        animals,
        (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
      // Return the response with the correct content type header
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
    } finally {
      // Release the connection back into the pool
      connection.release()
    }
  } catch (err) {
    console.error(err)
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
View source
Using Drizzle#
You can use Drizzle together with Postgres.js. Both can be loaded directly from npm:

Set up dependencies in import_map.json:

{
  "imports": {
    "drizzle-orm": "npm:drizzle-orm@0.29.1",
    "drizzle-orm/": "npm:/drizzle-orm@0.29.1/",
    "postgres": "npm:postgres@3.4.3"
  }
}
Use in your function:

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { countries } from '../_shared/schema.ts'
const connectionString = Deno.env.get('SUPABASE_DB_URL')!
Deno.serve(async (_req) => {
  // Disable prefetch as it is not supported for "Transaction" pool mode
  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client)
  const allCountries = await db.select().from(countries)
  return Response.json(allCountries)
})
You can find the full example on GitHub.

SSL connections#
Production#
Deployed edge functions are pre-configured to use SSL for connections to the Supabase database. You don't need to add any extra configurations.

Local development#
If you want to use SSL connections during local development, follow these steps:

Download the SSL certificate from Database Settings
Add to your local .env file, add these two variables:
SSL_CERT_FILE=/path/to/cert.crt # set the path to the downloaded cert
DENO_TLS_CA_STORE=mozilla,system
Then, restart your local development server:

supabase functions serve your-function
