import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Src Sift",
  description: "Browse Easily. Preview. Save. Ask AI.",
};

const About = async () => {
  return (
    <main className="flex flex-col items-center">
      <h1 className="text-2xl mb-8 mt-24 text-center">About</h1>
      <div className="max-w-xl text-sm">
        <p className="mb-4">
          Src Sift is an intuitive browser of sources of data, apis, and
          resources in general. It&rsquo;s initially centered around US gov open
          data, as centralized from many sources at the data.gov website. I
          wanted to change the feel of browsing this data from that site and to
          expand on some of the functionality.
        </p>
        <p>
          The project is in its early stages and any feedback is welcome. Please
          don't hesitate to reach out to me at{" "}
          <a href="mailto:tony@srcsift.io" className="underline">
            tony@srcsift.io
          </a>
          .
        </p>
      </div>
    </main>
  );
};

export default About;
