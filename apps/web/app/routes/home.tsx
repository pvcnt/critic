import { Button, Navbar } from "@blueprintjs/core";
import type { Route } from "./+types/home";
import classes from "./home.module.scss";
import { Link, NavLink } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Critic - Pull request inbox" }];
}

export default function Home() {
  return (
    <div className={classes.container}>
      <main className={classes.main}>
        <Navbar>
          <Navbar.Group align="start">
            <div className={classes.brand}>
              <img src="/logo.svg" alt="Critic Logo" />
              <div>Critic</div>
            </div>
          </Navbar.Group>
          <Navbar.Group align="end">
            <Link to="/login">
              <Button text="Login" intent="primary" size="large" />
            </Link>
          </Navbar.Group>
        </Navbar>

        <div className={classes.hero}>
          <h1>Never miss a review again.</h1>
          <p>
            Critic is the missing inbox for your pull requests.
            <br />
            Pull requests are tracked and organized, according to your own
            rules.
          </p>
          <div>
            <NavLink to="/login">
              <Button text="Get started" size="large" endIcon="arrow-right" />
            </NavLink>
            <span>Critic is free to use.</span>
          </div>
        </div>

        <img
          className={classes.screenshot}
          src="/screenshots/dashboard-no-sidebar.png"
          alt="Dashboard Screenshot"
        />
      </main>
    </div>
  );
}
