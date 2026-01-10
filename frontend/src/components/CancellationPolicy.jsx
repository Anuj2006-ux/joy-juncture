import React from 'react';
import './CancellationPolicy.css';


const CancellationPolicy = () => {
  return (
    <>
      <div className="policy-container">
        <h1>Cancellation Policy</h1>

        <p>At Joy Juncture, <strong>once you place an order,</strong> it's like locking in your move- <strong>it can't be undone!</strong></p>

        <p className="section-heading">Here's why:</p>

        <ul>
          <li>As soon as you hit that "Order" button, our elves get to work packing and prepping your goodies!</li>
          <li>To keep things smooth and fair for all gamers, <strong>we don't allow cancellations after the order is placed!</strong></li>
        </ul>

        <p>But don't worry, if there's a genuine issue (like receiving the wrong product or a defective one), we've got your back. Just check out our Return/Exchange Policy for help</p>

        <p className="section-heading">Also there can be cases where we sometimes <strong>hit pause on Orders...</strong></p>

        <p>At Joy Juncture, we're all about making your gaming experience seamless, but occasionally, we have to hit the brakes on an order. Why?</p>

        <p className="section-heading">Here are a few reasons your order might get benched:</p>

        <ul>
          <li>The game you picked is out of stock (we're sad too 😢)</li>
          <li>The quantities you want aren't available (everyone loves it, clearly!)</li>
          <li>We spotted a glitch in the pricing matrix</li>
          <li>Our anti-fraud bots raised their shields. Sometimes, we might ask for extra info to level up your order—don't worry, it's just part of the game!</li>
        </ul>

        <p>If we do have to cancel your order (or part of it), we'll let you know ASAP. And if you've already paid, we'll hit the "reverse" button to send your money back to your account</p>
      </div>


    </>
  );
};

export default CancellationPolicy;
